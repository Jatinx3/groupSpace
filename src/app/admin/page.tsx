"use client";

import { useState, useEffect } from "react";
import { 
  Users, BookOpen, Layers, CheckSquare, Activity, 
  Search, Shield, Plus, MoreHorizontal, ArrowUpRight, 
  Clock, CheckCircle, AlertCircle, AlertOctagon, Loader2 
} from "lucide-react";
import { createClientSupabase } from "@/src/lib/supabase-client";
import AdminDrawer from "@/src/components/admin/AdminDrawer";

type TabType = "professors" | "students" | "courses" | "teams" | "tasks" | "announcements";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("professors");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: string; data: any } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // States
  const [professors, setProfessors] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { label: "Total Users", value: "0", change: "+0%" },
    { label: "Courses", value: "0", change: "+0" },
    { label: "Teams", value: "0", change: "+0" },
    { label: "Tasks", value: "0", change: "+0" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/data");
        const json = await res.json();
        if (json.error) throw new Error(json.error);

        const { profs, studs, crs, crsMem, tms, tmsMem, tks, notifs, anns } = json;

        setAnnouncements(anns || []);

        // 1. Process Professors
        setProfessors((profs || []).map((p: any) => ({
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          email: p.email,
          courses: (crs || []).filter((c: any) => c.professor_id === p.id).length,
          students: (crsMem || []).filter((m: any) => 
            (crs || []).some((c: any) => c.id === m.course_id && c.professor_id === p.id)
          ).length,
          created_at: p.created_at ? p.created_at.split('T')[0] : "-"
        })));

        // 2. Process Students
        setStudents((studs || []).map((s: any) => ({
          id: s.id,
          name: `${s.first_name} ${s.last_name}`,
          email: s.email,
          courses: (crsMem || []).filter((m: any) => m.user_id === s.id).length,
          teams: (tmsMem || []).filter((m: any) => m.user_id === s.id).length,
          joined: s.created_at ? s.created_at.split('T')[0] : "-"
        })));

        // 3. Process Courses
        setCourses((crs || []).map((c: any) => {
          const prof = (profs || []).find((p: any) => p.id === c.professor_id);
          return {
            id: c.id,
            name: c.name,
            professor: prof ? `${prof.first_name} ${prof.last_name}` : "Unknown",
            teams: (tms || []).filter((t: any) => t.course_id === c.id).length,
            students: (crsMem || []).filter((m: any) => m.course_id === c.id).length,
            created_at: c.created_at ? c.created_at.split('T')[0] : "-"
          };
        }));

        // 4. Process Teams
        setTeams((tms || []).map((t: any) => {
          const course = (crs || []).find((c: any) => c.id === t.course_id);
          const tksCount = (tks || []).filter((tk: any) => tk.team_id === t.id).length;
          const completedTks = (tks || []).filter((tk: any) => tk.team_id === t.id && tk.status === "completed").length;
          return {
            id: t.id,
            name: t.name,
            course: course ? course.name : "Unknown",
            members: (tmsMem || []).filter((m: any) => m.team_id === t.id).length,
            tasks: tksCount,
            progress: tksCount > 0 ? Math.floor((completedTks / tksCount) * 100) : 0
          };
        }));

        // 5. Process Tasks
        setTasks((tks || []).map((tk: any) => {
          const team = (tms || []).find((t: any) => t.id === tk.team_id);
          const course = team ? (crs || []).find((c: any) => c.id === team.course_id) : null;
          return {
            id: tk.id,
            title: tk.title,
            team: team ? team.name : "Unknown",
            status: tk.status || "pending",
            priority: tk.priority || "medium",
            due: tk.due_date ? tk.due_date.split('T')[0] : "-",
            assigned: [] // simplified placeholder
          };
        }));

        setActivities((notifs || []).map((n: any) => ({
          user: n.title,
          action: "triggered",
          target: n.message,
          time: n.created_at ? formatRelativeTime(n.created_at) : "-"
        })));

        setStats([
          { label: "Total Users", value: `${(profs?.length || 0) + (studs?.length || 0)}`, change: "+0%" },
          { label: "Courses", value: `${crs?.length || 0}`, change: "+0" },
          { label: "Teams", value: `${tms?.length || 0}`, change: "+0" },
          { label: "Tasks", value: `${tks?.length || 0}`, change: "+0" },
        ]);
        setFetchError(null);

      } catch (err: any) {
        console.error("Dashboard Fetch Error:", err);
        setFetchError(err.message || "An unknown error occurred during fetch.");
      } finally {
        setLoading(false);
      }
    };

    const formatRelativeTime = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      if (diffInSeconds < 60) return "just now";
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) return `${diffInMinutes}m`;
      const diffInHours = Math.floor(diffInMinutes / 60);
      return diffInHours < 24 ? `${diffInHours}h` : `${Math.floor(diffInHours/24)}d`;
    };

    fetchData();
  }, [refreshTrigger]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Done</span>;
      case "in_progress": return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1"><Clock className="w-3 h-3" /> Active</span>;
      default: return <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Pending</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high": return <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1"><AlertOctagon className="w-3 h-3" /> High</span>;
      case "medium": return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded text-[10px]">Medium</span>;
      default: return <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded text-[10px]">Low</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-zinc-300 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="px-6 py-3 border-b border-zinc-900 flex items-center justify-between bg-[#0B0B0B]">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-zinc-100" />
          <h1 className="text-sm font-semibold tracking-tight text-white">Admin Dashboard</h1>
        </div>

        {/* Inline Stats */}
        <div className="hidden md:flex items-center gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-baseline gap-2 text-xs">
              <span className="text-zinc-500">{stat.label}:</span>
              <span className="font-semibold text-zinc-300">{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-zinc-900/50 border border-zinc-800 rounded-md pl-7 pr-3 py-1 text-xs w-40 focus:outline-none focus:border-zinc-700 text-zinc-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={() => { setSelectedItem({ type: "announcements", data: { isNew: true } }); setIsDrawerOpen(true); }} className="bg-white text-black text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 hover:bg-zinc-200 transition">
            <Plus className="w-3 h-3" /> Broadcast
          </button>
        </div>
      </header>

      {/* Main Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-transparent">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        </div>
      ) : fetchError ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-transparent text-zinc-400 space-y-2">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-sm font-semibold text-white">Fetch Error</p>
          <p className="text-xs text-zinc-500 max-w-md text-center">{fetchError}</p>
          <button onClick={() => setRefreshTrigger(p => p + 1)} className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded text-xs text-zinc-200 mt-2">Retry</button>
        </div>
      ) : (
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-10 gap-0">
          {/* LEFT SIDE (70%) */}
          <div className="lg:col-span-7 border-r border-zinc-900 flex flex-col">
            <div className="flex items-center border-b border-zinc-900 bg-[#090909] px-4">
              {(["professors", "students", "courses", "teams", "tasks", "announcements"] as TabType[]).map((tab) => {
                const icons = { professors: Users, students: Users, courses: BookOpen, teams: Layers, tasks: CheckSquare, announcements: AlertCircle };
                const Icon = icons[tab];
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-1.5 px-4 py-2 border-b text-xs font-medium transition ${
                      activeTab === tab 
                        ? "border-white text-white bg-zinc-900/50" 
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="capitalize">{tab}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex-1 overflow-auto p-4 max-h-[calc(100vh-85px)]">
              <div className="border border-zinc-900 rounded-lg overflow-hidden bg-[#0A0A0A]">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="bg-[#0D0D0D] border-b border-zinc-900 text-zinc-500">
                    {activeTab === "professors" && (
                      <tr>
                        <th className="py-2 px-3 font-medium">Name</th>
                        <th className="py-2 px-3 font-medium">Email</th>
                        <th className="py-2 px-3 font-medium text-right">Courses</th>
                        <th className="py-2 px-3 font-medium text-right">Students</th>
                        <th className="py-2 px-3 font-medium text-right">Created At</th>
                      </tr>
                    )}
                    {activeTab === "students" && (
                      <tr>
                        <th className="py-2 px-3 font-medium">Name</th>
                        <th className="py-2 px-3 font-medium">Email</th>
                        <th className="py-2 px-3 font-medium text-right">Enrolled</th>
                        <th className="py-2 px-3 font-medium text-right">Teams</th>
                        <th className="py-2 px-3 font-medium text-right">Joined</th>
                      </tr>
                    )}
                    {activeTab === "courses" && (
                      <tr>
                        <th className="py-2 px-3 font-medium">Course Name</th>
                        <th className="py-2 px-3 font-medium">Professor</th>
                        <th className="py-2 px-3 font-medium text-right">Teams</th>
                        <th className="py-2 px-3 font-medium text-right">Students</th>
                        <th className="py-2 px-3 font-medium text-right">Created</th>
                      </tr>
                    )}
                    {activeTab === "teams" && (
                      <tr>
                        <th className="py-2 px-3 font-medium">Team Name</th>
                        <th className="py-2 px-3 font-medium">Course</th>
                        <th className="py-2 px-3 font-medium text-right">Members</th>
                        <th className="py-2 px-3 font-medium text-right">Tasks</th>
                        <th className="py-2 px-3 font-medium text-right">Progress</th>
                      </tr>
                    )}
                    {activeTab === "tasks" && (
                      <tr>
                        <th className="py-2 px-3 font-medium">Title</th>
                        <th className="py-2 px-3 font-medium">Team</th>
                        <th className="py-2 px-3 font-medium">Status</th>
                        <th className="py-2 px-3 font-medium">Priority</th>
                        <th className="py-2 px-3 font-medium text-right">Due</th>
                      </tr>
                    )}
                    {activeTab === "announcements" && (
                      <tr>
                        <th className="py-2 px-3 font-medium">Title</th>
                        <th className="py-2 px-3 font-medium">Audience</th>
                        <th className="py-2 px-3 font-medium">Priority</th>
                        <th className="py-2 px-3 font-medium text-right">Created</th>
                      </tr>
                    )}

                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-300">
                    {activeTab === "professors" && professors.map((p, i) => (
                      <tr key={i} onClick={() => { setSelectedItem({ type: "professors", data: p }); setIsDrawerOpen(true); }} className="hover:bg-zinc-900/40 transition cursor-pointer">
                        <td className="py-2 px-3 font-medium text-zinc-100 flex items-center gap-1.5"><div className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] flex items-center justify-center border border-zinc-700">{p.name[0]}</div>{p.name}</td>
                        <td className="py-2 px-3 text-zinc-500">{p.email}</td>
                        <td className="py-2 px-3 text-right">{p.courses}</td>
                        <td className="py-2 px-3 text-right">{p.students}</td>
                        <td className="py-2 px-3 text-right text-zinc-500">{p.created_at}</td>
                      </tr>
                    ))}
                    {activeTab === "students" && students.map((s, i) => (
                      <tr key={i} onClick={() => { setSelectedItem({ type: "students", data: s }); setIsDrawerOpen(true); }} className="hover:bg-zinc-900/40 transition cursor-pointer">
                        <td className="py-2 px-3 font-medium text-zinc-100 flex items-center gap-1.5"><div className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] flex items-center justify-center border border-zinc-700">{s.name[0]}</div>{s.name}</td>
                        <td className="py-2 px-3 text-zinc-500">{s.email}</td>
                        <td className="py-2 px-3 text-right">{s.courses}</td>
                        <td className="py-2 px-3 text-right">{s.teams}</td>
                        <td className="py-2 px-3 text-right text-zinc-500">{s.joined}</td>
                      </tr>
                    ))}
                    {activeTab === "courses" && courses.map((c, i) => (
                      <tr key={i} onClick={() => { setSelectedItem({ type: "courses", data: c }); setIsDrawerOpen(true); }} className="hover:bg-zinc-900/40 transition cursor-pointer">
                        <td className="py-2 px-3 font-medium text-zinc-100">{c.name}</td>
                        <td className="py-2 px-3 text-zinc-500">{c.professor}</td>
                        <td className="py-2 px-3 text-right">{c.teams}</td>
                        <td className="py-2 px-3 text-right">{c.students}</td>
                        <td className="py-2 px-3 text-right text-zinc-500">{c.created_at}</td>
                      </tr>
                    ))}
                    {activeTab === "teams" && teams.map((t, i) => (
                      <tr key={i} onClick={() => { setSelectedItem({ type: "teams", data: t }); setIsDrawerOpen(true); }} className="hover:bg-zinc-900/40 transition cursor-pointer">
                        <td className="py-2 px-3 font-medium text-zinc-100">{t.name}</td>
                        <td className="py-2 px-3 text-zinc-500">{t.course}</td>
                        <td className="py-2 px-3 text-right">{t.members}</td>
                        <td className="py-2 px-3 text-right">{t.tasks}</td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${t.progress}%` }} />
                            </div>
                            <span className="text-[10px] text-zinc-400">{t.progress}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {activeTab === "tasks" && tasks.map((tk, i) => (
                      <tr key={i} onClick={() => { setSelectedItem({ type: "tasks", data: tk }); setIsDrawerOpen(true); }} className="hover:bg-zinc-900/40 transition cursor-pointer">
                        <td className="py-2 px-3 font-medium text-zinc-100 truncate max-w-[120px]">{tk.title}</td>
                        <td className="py-2 px-3 text-zinc-500">{tk.team}</td>
                        <td className="py-2 px-3">{getStatusBadge(tk.status)}</td>
                        <td className="py-2 px-3">{getPriorityBadge(tk.priority)}</td>
                        <td className="py-2 px-3 text-right text-zinc-500">{tk.due}</td>
                      </tr>
                    ))}
                    {activeTab === "announcements" && announcements.map((ann, i) => (
                      <tr key={i} onClick={() => { setSelectedItem({ type: "announcements", data: ann }); setIsDrawerOpen(true); }} className="hover:bg-zinc-900/40 transition cursor-pointer">
                        <td className="py-2 px-3 font-medium text-zinc-100">{ann.title}</td>
                        <td className="py-2 px-3 text-zinc-500 capitalize">{ann.audience_type}</td>
                        <td className="py-2 px-3">{getPriorityBadge(ann.priority)}</td>
                        <td className="py-2 px-3 text-right text-zinc-500">{ann.created_at?.split('T')[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE (30%) */}
          <div className="lg:col-span-3 bg-[#080808] flex flex-col p-4 space-y-5 overflow-auto max-h-[calc(100vh-45px)]">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Activity className="w-3.5 h-3.5" />
                <h2 className="text-xs font-semibold uppercase tracking-wider">System Health</h2>
              </div>
              <div className="border border-zinc-900 rounded-lg p-3 bg-[#060606] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Total Records</span>
                  <span className="font-semibold text-zinc-200">{parseInt(stats[0].value) + parseInt(stats[1].value) + parseInt(stats[2].value)}</span>
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider">Recent Activity</h2>
                </div>
              </div>
              <div className="border border-zinc-900 rounded-lg bg-[#060606] flex-1 overflow-auto divide-y divide-zinc-900">
                {activities.length === 0 && <p className="text-zinc-600 text-[10px] p-4 text-center">No recent actions</p>}
                {activities.map((act, i) => (
                  <div key={i} className="px-3 py-2.5 flex justify-between items-start text-xs hover:bg-zinc-900/30 transition">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-zinc-200 truncate max-w-[80px]">{act.user}</span>
                        <span className="text-zinc-600">triggered</span>
                      </div>
                      <p className="text-zinc-500 text-[10px] line-clamp-1">{act.target}</p>
                    </div>
                    <span className="text-[10px] text-zinc-600 shrink-0">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}
      {isDrawerOpen && <div onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />}
      <AdminDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} item={selectedItem} onRefresh={() => setRefreshTrigger(p => p + 1)} />
    </div>
  );
}
