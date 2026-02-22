import { redirect } from "next/navigation";
import { createServerSupabase } from "../../lib/supabase-server";

export default async function StudentDashboardPage() {
  const supabase = await createServerSupabase();

  // 🔐 Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 🔐 Validate student role
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    redirect("/login");
  }

  // 📊 Fetch student teams
  const { data: teams } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id);

  const teamIds = teams?.map((t) => t.team_id) ?? [];

  // 📋 Fetch tasks for those teams
  const { data: tasks } = teamIds.length
    ? await supabase
        .from("tasks")
        .select("*")
        .in("team_id", teamIds)
    : { data: [] };

  const totalTeams = teamIds.length;
  const totalTasks = tasks?.length ?? 0;
  const pendingTasks =
    tasks?.filter((task) => task.status !== "completed").length ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-12">
        
        {/* Greeting */}
        <section>
          <h1 className="text-3xl font-semibold text-slate-800">
            Welcome back, {profile.first_name}
          </h1>
          <p className="text-slate-500 mt-2">
            Here’s an overview of your academic workspace.
          </p>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="text-sm text-slate-500">Teams</h3>
            <p className="text-2xl font-semibold mt-2">{totalTeams}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="text-sm text-slate-500">Total Tasks</h3>
            <p className="text-2xl font-semibold mt-2">{totalTasks}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="text-sm text-slate-500">Pending Tasks</h3>
            <p className="text-2xl font-semibold mt-2">{pendingTasks}</p>
          </div>
        </section>

        {/* Deadlines + Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Deadlines */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">
              Upcoming Deadlines
            </h2>

            {tasks && tasks.length > 0 ? (
              <ul className="space-y-3">
                {tasks
                  .filter((task) => task.status !== "completed")
                  .slice(0, 5)
                  .map((task) => (
                    <li
                      key={task.id}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <span className="text-slate-700">
                        {task.title}
                      </span>
                      <span className="text-sm text-slate-500">
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString()
                          : "No due date"}
                      </span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm">
                No upcoming tasks 🎉
              </p>
            )}
          </div>

          {/* Activity Feed Placeholder */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">
              Recent Activity
            </h2>
            <p className="text-slate-500 text-sm">
              Activity tracking coming soon.
            </p>
          </div>
        </section>

        {/* Teams Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Your Teams
          </h2>

          {totalTeams > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamIds.map((teamId) => (
                <a
                  key={teamId}
                  href={`/student/teams/${teamId}`}
                  className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition"
                >
                  <p className="font-medium text-slate-700">
                    Team {teamId.slice(0, 6)}
                  </p>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">
              You are not part of any team yet.
            </p>
          )}
        </section>

      </div>
    </div>
  );
}