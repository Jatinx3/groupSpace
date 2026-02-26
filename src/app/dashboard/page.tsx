import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, ClipboardList, Clock } from "lucide-react";
import { createServerSupabase } from "../../lib/supabase-server";

export default async function StudentDashboardPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    redirect("/login");
  }

  const { data: teams } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id);

  const teamIds = teams?.map((t) => t.team_id) ?? [];

  const { data: tasks } = teamIds.length
    ? await supabase
        .from("tasks")
        .select("id, title, status, due_date, team_id")
        .in("team_id", teamIds)
    : { data: [] };

  const totalTeams = teamIds.length;
  const totalTasks = tasks?.length ?? 0;
  const pendingTasks =
    tasks?.filter((task) => task.status !== "completed").length ?? 0;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">

        <section>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            {greeting}, {profile.first_name}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Here's an overview of your academic workspace.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Teams</p>
              <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-gray-900 mt-3">
              {totalTeams}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Total Tasks</p>
              <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-gray-900 mt-3">
              {totalTasks}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Pending</p>
              <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-gray-900 mt-3">
              {pendingTasks}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-5">
              Upcoming Deadlines
            </h2>

            {tasks && tasks.filter((t) => t.status !== "completed" && t.due_date).length > 0 ? (
              <div className="space-y-3">
                {tasks
                  .filter((task) => task.status !== "completed" && task.due_date)
                  .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
                  .slice(0, 5)
                  .map((task) => {
                    const daysLeft = Math.ceil(
                      (new Date(task.due_date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <div
                        key={task.id}
                        className={`border-l-2 pl-4 py-1.5 ${
                          daysLeft <= 3 ? "border-black" : daysLeft <= 7 ? "border-gray-500" : "border-gray-200"
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Due in {daysLeft} day{daysLeft !== 1 && "s"}
                        </p>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No upcoming deadlines.</p>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-5">
              Quick Links
            </h2>
            <div className="space-y-2">
              <Link
                href="/student"
                className="block px-4 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-900 transition"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/student/teams"
                className="block px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                My Teams
              </Link>
            </div>
          </div>
        </section>

        {totalTeams > 0 && (
          <section>
            <h2 className="font-semibold text-gray-900 mb-4">Your Teams</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamIds.map((teamId) => (
                <Link
                  key={teamId}
                  href={`/student/teams/${teamId}`}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-gray-600" />
                    </div>
                    <p className="font-medium text-gray-900 text-sm">
                      Team {teamId.slice(0, 6)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
