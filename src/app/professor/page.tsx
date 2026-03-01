import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  BookOpen,
  Clock,
  ArrowRight,
  Plus,
  FileText,
  CheckCircle2,
  Calendar,
  BarChart2,
  ChevronRight,
} from "lucide-react";
import { createServerSupabase } from "../../lib/supabase-server";

function ThesisStatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === "completed")
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Completed
      </span>
    );
  if (s === "proposal")
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        Proposal
      </span>
    );
  if (s === "review" || s === "under review")
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
        Under Review
      </span>
    );
  if (s === "in_progress" || s === "research" || s === "writing")
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        In Progress
      </span>
    );
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
      {status || "Unknown"}
    </span>
  );
}

export default async function ProfessorPage() {
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

  if (!profile || profile.role !== "professor") {
    redirect("/dashboard");
  }

  const firstName = profile.first_name || "Professor";

  const { data: courses } = await supabase
    .from("courses")
    .select("id, name")
    .eq("professor_id", user.id);

  const courseIds = courses?.map((c) => c.id) ?? [];

  const { data: courseMembers } = courseIds.length
    ? await supabase
        .from("course_members")
        .select("course_id, user_id")
        .in("course_id", courseIds)
    : { data: [] };

  const { data: courseTeams } = courseIds.length
    ? await supabase
        .from("teams")
        .select("id, course_id")
        .in("course_id", courseIds)
    : { data: [] };

  const { data: thesesRaw } = await supabase
    .from("thesis_projects")
    .select(
      `
      id,
      title,
      status,
      deadline,
      created_at,
      student:profiles!thesis_projects_student_id_fkey (
        first_name,
        last_name
      )
    `
    )
    .eq("supervisor_id", user.id)
    .order("created_at", { ascending: false });

  const thesisIds = thesesRaw?.map((t) => t.id) ?? [];

  const { data: milestones } = thesisIds.length
    ? await supabase
        .from("thesis_milestones")
        .select("id, thesis_id, status, title, created_at")
        .in("thesis_id", thesisIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const progressByThesis: Record<string, { total: number; approved: number }> =
    {};

  (milestones ?? []).forEach((m: any) => {
    if (!progressByThesis[m.thesis_id]) {
      progressByThesis[m.thesis_id] = { total: 0, approved: 0 };
    }
    progressByThesis[m.thesis_id].total += 1;
    if (m.status === "approved") progressByThesis[m.thesis_id].approved += 1;
  });

  const theses = (thesesRaw ?? []).map((t: any) => {
    const stats = progressByThesis[t.id] ?? { total: 0, approved: 0 };
    return {
      id: t.id,
      title: t.title,
      status: t.status,
      deadline: t.deadline,
      createdAt: t.created_at,
      studentName: t.student
        ? `${t.student.first_name} ${t.student.last_name}`
        : "Unknown",
      progress:
        stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0,
    };
  });

  const totalStudents = new Set(courseMembers?.map((m) => m.user_id) ?? []).size;
  const activeTheses = theses.filter((t) => t.status !== "completed").length;
  const courseCount = courses?.length ?? 0;
  const pendingMilestones = (milestones ?? []).filter(
    (m: any) => m.status === "submitted"
  ).length;

  const teamCountByCourse: Record<string, number> = {};
  (courseTeams ?? []).forEach((t: any) => {
    teamCountByCourse[t.course_id] = (teamCountByCourse[t.course_id] ?? 0) + 1;
  });

  const studentCountByCourse: Record<string, number> = {};
  (courseMembers ?? []).forEach((m: any) => {
    studentCountByCourse[m.course_id] =
      (studentCountByCourse[m.course_id] ?? 0) + 1;
  });

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const season =
    now.getMonth() < 5 ? "Spring" : now.getMonth() < 8 ? "Summer" : "Fall";
  const year = now.getFullYear();

  function timeAgo(dateStr: string) {
    const diff = now.getTime() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    if (h < 1) return "Just now";
    if (h < 24) return `${h}h ago`;
    if (d === 1) return "Yesterday";
    return `${d}d ago`;
  }

  type ActivityEntry = {
    id: string;
    icon: typeof FileText;
    text: string;
    time: string;
    ts: number;
  };

  const recentActivity: ActivityEntry[] = [];

  (milestones ?? [])
    .filter((m: any) => m.status === "submitted" && m.created_at)
    .slice(0, 3)
    .forEach((m: any) => {
      const thesis = theses.find((t) => t.id === m.thesis_id);
      if (!thesis) return;
      recentActivity.push({
        id: `m-${m.id}`,
        icon: FileText,
        text: `${thesis.studentName} submitted ${m.title ?? "a milestone"}`,
        time: timeAgo(m.created_at),
        ts: new Date(m.created_at).getTime(),
      });
    });

  (milestones ?? [])
    .filter((m: any) => m.status === "approved" && m.created_at)
    .slice(0, 2)
    .forEach((m: any) => {
      const thesis = theses.find((t) => t.id === m.thesis_id);
      if (!thesis) return;
      recentActivity.push({
        id: `a-${m.id}`,
        icon: CheckCircle2,
        text: `Milestone approved: ${m.title ?? "milestone"} (${thesis.studentName})`,
        time: timeAgo(m.created_at),
        ts: new Date(m.created_at).getTime(),
      });
    });

  theses.slice(0, 2).forEach((t) => {
    if (!t.createdAt) return;
    recentActivity.push({
      id: `t-${t.id}`,
      icon: Plus,
      text: `New thesis: ${t.title} (${t.studentName})`,
      time: timeAgo(t.createdAt),
      ts: new Date(t.createdAt).getTime(),
    });
  });

  theses
    .filter((t) => {
      if (!t.deadline) return false;
      const daysLeft = Math.ceil(
        (new Date(t.deadline).getTime() - now.getTime()) / 86400000
      );
      return daysLeft > 0 && daysLeft <= 14;
    })
    .slice(0, 1)
    .forEach((t) => {
      recentActivity.push({
        id: `d-${t.id}`,
        icon: Clock,
        text: `Deadline approaching: ${t.title} (${new Date(t.deadline!).toLocaleDateString("en-US", { month: "short", day: "numeric" })})`,
        time: "3 days",
        ts: now.getTime() - 86400000 * 3,
      });
    });

  const sortedActivity = recentActivity.sort((a, b) => b.ts - a.ts).slice(0, 5);

  const stats = [
    {
      label: "Total Students",
      value: totalStudents,
      sub: "Across all courses",
      icon: Users,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50",
    },
    {
      label: "Active Theses",
      value: activeTheses,
      sub: "Under supervision",
      icon: FileText,
      iconColor: "text-violet-500",
      iconBg: "bg-violet-50",
    },
    {
      label: "Courses Running",
      value: courseCount,
      sub: `${season} ${year}`,
      icon: BookOpen,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50",
    },
    {
      label: "Pending Reviews",
      value: pendingMilestones,
      sub: "Milestones to review",
      icon: Clock,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-50",
    },
  ];

  const activeThesesList = theses.filter((t) => t.status !== "completed");

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Overview · {season} {year}
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-gray-500 mt-1.5">
              Your central workspace for courses and thesis supervision.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
            <div className="sm:text-right">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Today
              </p>
              <p className="text-sm font-medium text-gray-700 mt-0.5">
                {dateLabel}
              </p>
            </div>
            <Link
              href="/professor/thesis"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
            >
              Thesis Collab
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className={`inline-flex p-2.5 rounded-xl ${iconBg} mb-4`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <p className="text-3xl font-bold text-gray-900 tracking-tight tabular-nums">
              {value}
            </p>
            <p className="text-sm font-medium text-gray-800 mt-1">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Main 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT col */}
        <div className="lg:col-span-2 space-y-6">
          {/* Your Courses */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Teaching
                </p>
                <h2 className="text-base font-semibold text-gray-900 mt-0.5">
                  Your Courses
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {courseCount > 0 && (
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {courseCount} active
                  </span>
                )}
                <Link
                  href="/professor/courses"
                  className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition"
                >
                  Manage
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {(courses ?? []).length === 0 && (
                <div className="px-6 pb-6">
                  <p className="text-sm text-gray-400">No courses assigned yet.</p>
                </div>
              )}
              {(courses ?? []).map((course) => {
                const studentCount = studentCountByCourse[course.id] ?? 0;
                const teamCount = teamCountByCourse[course.id] ?? 0;
                return (
                  <Link
                    key={course.id}
                    href={`/professor/courses/${course.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {course.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 ml-4">
                      <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          <span className="font-semibold text-gray-700 tabular-nums">{studentCount}</span>
                          {" "}students
                        </span>
                        <span>
                          <span className="font-semibold text-gray-700 tabular-nums">{teamCount}</span>
                          {" "}teams
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Active Supervisees */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Thesis Collab
                </p>
                <h2 className="text-base font-semibold text-gray-900 mt-0.5">
                  Active Supervisees
                </h2>
              </div>
              <Link
                href="/professor/thesis"
                className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition"
              >
                View all
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-gray-50">
              {activeThesesList.length === 0 && (
                <div className="px-6 pb-6">
                  <p className="text-sm text-gray-400">No thesis projects yet.</p>
                </div>
              )}
              {activeThesesList.slice(0, 5).map((thesis) => (
                <Link
                  key={thesis.id}
                  href={`/professor/thesis/${thesis.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {thesis.title}
                      </p>
                      <ThesisStatusBadge status={thesis.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{thesis.studentName}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gray-800 transition-all"
                          style={{ width: `${thesis.progress}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-gray-400 tabular-nums w-8 text-right shrink-0">
                        {thesis.progress}%
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT col */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Quick Actions
            </p>
            <div className="space-y-2">
              <Link
                href="/professor/thesis"
                className="flex items-center gap-3 w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 rounded-xl text-sm font-medium transition"
              >
                <Plus className="w-4 h-4 shrink-0" />
                Create New Thesis
              </Link>
              <Link
                href="/professor/thesis"
                className="flex items-center gap-3 w-full border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-xl text-sm font-medium transition"
              >
                <Clock className="w-4 h-4 shrink-0 text-gray-400" />
                Review Submissions
              </Link>
              <Link
                href="/professor/courses"
                className="flex items-center gap-3 w-full border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-xl text-sm font-medium transition"
              >
                <BarChart2 className="w-4 h-4 shrink-0 text-gray-400" />
                Manage Courses
              </Link>
              <button className="flex items-center gap-3 w-full border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-xl text-sm font-medium transition">
                <Calendar className="w-4 h-4 shrink-0 text-gray-400" />
                Schedule Meeting
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Recent Activity
            </p>
            <div className="space-y-4">
              {sortedActivity.length === 0 && (
                <p className="text-sm text-gray-400">No recent activity.</p>
              )}
              {sortedActivity.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 leading-snug">
                        {item.text}
                      </p>
                      {item.time && (
                        <p className="text-[11px] text-gray-400 mt-0.5">{item.time}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Thesis Progress */}
          {activeThesesList.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
                Thesis Progress
              </p>
              <div className="space-y-3">
                {activeThesesList.slice(0, 5).map((thesis) => (
                  <div key={thesis.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-medium text-gray-700 truncate flex-1 min-w-0 mr-2">
                        {thesis.studentName}
                      </p>
                      <span className="text-xs text-gray-500 tabular-nums shrink-0">
                        {thesis.progress}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          thesis.progress === 0
                            ? "bg-gray-300"
                            : thesis.progress >= 75
                            ? "bg-emerald-500"
                            : thesis.progress >= 40
                            ? "bg-violet-500"
                            : "bg-blue-400"
                        }`}
                        style={{ width: `${thesis.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
