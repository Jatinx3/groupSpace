import { redirect } from "next/navigation";
import { createServerSupabase } from "../../lib/supabase-server";
import Greeting from "../../components/dashboard/Greeting";
import StatsGrid from "../../components/dashboard/StatsGrid";
import DeadlineList from "../../components/dashboard/DeadlineList";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import CourseGrid from "../../components/dashboard/CourseGrid";
import TeamGrid from "../../components/dashboard/TeamGrid";

export default async function StudentDashboard() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name")
    .eq("id", user.id)
    .single();
    
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
    .filter(Boolean) || [];

const courses =
  enrolledCourses?.flatMap((item) => item.courses) || [];

  if (!profile || profile.role !== "student") {
    redirect("/dashboard");
  }
  
console.log("USER ID:", user.id);

  const firstName = profile.first_name || "Student";

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
      ? "Good afternoon"
      : "Good evening";

  return (
  <div className="space-y-12">
    <Greeting greeting={greeting} name={firstName} />

    <StatsGrid />

    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <DeadlineList />
      </div>
      <div>
        <ActivityFeed />
      </div>
    </section>

    <CourseGrid courses={courses}/>

    <TeamGrid teams={teams} />
  </div>
);
}