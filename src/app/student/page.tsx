import { redirect } from "next/navigation";
import { createServerSupabase } from "../../lib/supabase-server";

import Greeting from "../../components/dashboard/Greeting";
import StatsGrid from "../../components/dashboard/StatsGrid";
import DeadlineList from "../../components/dashboard/DeadlineList";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import MiniCalendar from "../../components/dashboard/MiniCalendar";
import TaskProgress from "../../components/dashboard/TaskProgress";
import { Plus, UploadCloud, Users } from "lucide-react";
import { enrollInDefaultCourses } from "../../lib/enroll-utils";

export default async function StudentDashboard() {
  const supabase = await createServerSupabase();

  /* =========================
     AUTH
  ========================= */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    redirect("/");
  }

  /* =========================
     COURSES
  ========================= */
  const { data: enrolledCourses } = await supabase
    .from("course_members")
    .select(`
      course_id,
      courses (
        id,
        name,
        professor_id
      )
    `)
    .eq("user_id", user.id);

  let courses =
    enrolledCourses?.flatMap((item) => item.courses ?? []) ?? [];

  // ── SANITY CHECK: Auto-enroll if missing (Self-healing) ──────────────
  if (courses.length === 0) {
    const { ok } = await enrollInDefaultCourses(user.id);
    if (ok) {
      // Re-fetch to show them immediately
      const { data: refetched } = await supabase
        .from("course_members")
        .select(`
          course_id,
          courses (id, name, professor_id)
        `)
        .eq("user_id", user.id);
      courses = refetched?.flatMap((item) => item.courses ?? []) ?? [];
    }
  }

  /* =========================
     TEAMS
  ========================= */
  const { data: enrolledTeams } = await supabase
    .from("team_members")
    .select(`
      team_id,
      teams (
        id,
        name,
        course_id,
        courses (
          id,
          name
        )
      )
    `)
    .eq("user_id", user.id);

  const teams =
    enrolledTeams
      ?.flatMap((item) => item.teams ?? [])
      .filter(Boolean) ?? [];

  const teamIds = teams.map((t) => t.id);

  /* =========================
     TASKS (FIXED: include created_at)
  ========================= */
  const { data: tasks } = teamIds.length
    ? await supabase
        .from("tasks")
        .select(
          "id, title, status, due_date, team_id, created_at"
        )
        .in("team_id", teamIds)
    : { data: [] };

  const safeTasks = tasks ?? [];

  const totalTasks = safeTasks.length;

  const completedTasks = safeTasks.filter(
    (t) => t.status === "completed"
  ).length;

  const pendingTasks = safeTasks.filter(
    (t) => t.status !== "completed"
  ).length;

  const completionRate =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

  /* =========================
     UPCOMING DEADLINES
  ========================= */
  const now = new Date();

  const upcomingTasks = safeTasks
    .filter(
      (t) =>
        t.status !== "completed" &&
        t.due_date &&
        new Date(t.due_date) >= now
    )
    .sort(
      (a, b) =>
        new Date(a.due_date!).getTime() -
        new Date(b.due_date!).getTime()
    )
    .slice(0, 5);

  /* =========================
     GREETING
  ========================= */
  const firstName = profile.first_name || "Student";

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
      ? "Good afternoon"
      : "Good evening";

  /* =========================
     UI
  ========================= */

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="flex-1">
          <Greeting greeting={greeting} name={firstName} />
        </div>
      </div>

      <StatsGrid
        totalCourses={courses.length}
        totalTasks={totalTasks}
        totalTeams={teams.length}
        pendingTasks={pendingTasks}
      />

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <DeadlineList tasks={upcomingTasks} teams={teams} />
          <TaskProgress tasks={safeTasks} teams={teams} completionRate={completionRate} />
        </div>

        <div className="space-y-6">
          <MiniCalendar tasks={safeTasks} />
          <ActivityFeed tasks={safeTasks} teams={teams} />
        </div>
      </section>
    </>
  );
}