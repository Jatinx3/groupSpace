"use client";

import { useEffect, useState } from "react";
import { X, Trash2, Save, User, BookOpen, Layers, CheckSquare, LinkIcon, Loader2 } from "lucide-react";
import { updateUser, deleteUser, updateCourse, deleteCourse, updateTeam, deleteTeam, updateTask, deleteTask, removeUserFromCourse, removeUserFromTeam } from "@/src/app/admin/actions";
import { createAnnouncement, deleteAnnouncement } from "@/src/app/admin/announcement-actions";
import { createClientSupabase } from "@/src/lib/supabase-client";

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: { type: string; data: any } | null;
  onRefresh: () => void;
}

export default function AdminDrawer({ isOpen, onClose, item, onRefresh }: AdminDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [relations, setRelations] = useState<any>({ courses: [], teams: [], students: [] });
  const [fetchingRelations, setFetchingRelations] = useState(false);

  useEffect(() => {
    if (item && item.data) {
      setFormData({ ...item.data });
      fetchRelations();
    }
  }, [item]);

  const fetchRelations = async () => {
    if (!item || !item.data.id) return;
    setFetchingRelations(true);

    try {
      const res = await fetch(`/api/admin/relations?type=${item.type}&id=${item.data.id}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setRelations(json);
    } catch (err) {
      console.error("Relations fetch error:", err);
    } finally {
      setFetchingRelations(false);
    }
  };

  if (!isOpen || !item) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const id = item.data.id;
      if (item.type === "professors" || item.type === "students") {
        const [first_name, ...last_name] = formData.name ? formData.name.split(" ") : ["", ""];
        await updateUser(id, { first_name, last_name: last_name.join(" "), email: formData.email });
      } else if (item.type === "courses") {
        await updateCourse(id, { name: formData.name });
      } else if (item.type === "teams") {
        await updateTeam(id, { name: formData.name });
      } else if (item.type === "tasks") {
        await updateTask(id, { title: formData.title, status: formData.status, priority: formData.priority });
      } else if (item.type === "announcements") {
        if (item.data.isNew) {
          await createAnnouncement({
            title: formData.title,
            content: formData.content,
            audience_type: formData.audience_type || "all",
            priority: formData.priority || "normal",
            display_type: "banner",
            audience_id: formData.audience_id || null
          });
        }
      }
      onRefresh();
      onClose();
    } catch (err: any) {
      alert(`Save Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this ${item.type.slice(0, -1)}?`)) return;
    setLoading(true);
    try {
      const id = item.data.id;
      if (item.type === "professors" || item.type === "students") await deleteUser(id);
      else if (item.type === "courses") await deleteCourse(id);
      else if (item.type === "teams") await deleteTeam(id);
      else if (item.type === "tasks") await deleteTask(id);
      else if (item.type === "announcements") await deleteAnnouncement(id);
      onRefresh();
      onClose();
    } catch (err: any) {
      alert(`Delete Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-[#0A0A0A] border-l border-zinc-900 shadow-2xl z-50 flex flex-col animation-slide-in">
      {/* Header */}
      <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-[#0D0D0D]">
        <div className="flex items-center gap-2">
          {item.type === "professors" && <User className="w-4 h-4 text-zinc-400" />}
          {item.type === "courses" && <BookOpen className="w-4 h-4 text-zinc-400" />}
          {item.type === "teams" && <Layers className="w-4 h-4 text-zinc-400" />}
          <h2 className="text-sm font-semibold capitalize text-white">{item.type.slice(0, -1)} Details</h2>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-md transition text-zinc-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body / Forms */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">General Information</h3>
          
          {/* USER FORM */}
          {(item.type === "professors" || item.type === "students") && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-zinc-500">Name</label>
                <input type="text" value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded p-1.5 text-xs text-zinc-100 mt-1 focus:border-zinc-700 outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-zinc-500">Email</label>
                <input type="email" value={formData.email || ""} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded p-1.5 text-xs text-zinc-100 mt-1 focus:border-zinc-700 outline-none" />
              </div>
            </div>
          )}

          {/* COURSE FORM / TEAM FORM */}
          {(item.type === "courses" || item.type === "teams") && (
            <div>
              <label className="text-[11px] text-zinc-500">Name</label>
              <input type="text" value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded p-1.5 text-xs text-zinc-100 mt-1 focus:border-zinc-700 outline-none" />
            </div>
          )}

          {/* TASK FORM */}
          {item.type === "tasks" && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-zinc-500">Title</label>
                <input type="text" value={formData.title || ""} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded p-1.5 text-xs text-zinc-100 mt-1 focus:border-zinc-700 outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-zinc-500">Status</label>
                <select value={formData.status || "pending"} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded p-1.5 text-xs text-zinc-100 mt-1 focus:border-zinc-700 outline-none">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-zinc-500">Priority</label>
                <select value={formData.priority || "medium"} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded p-1.5 text-xs text-zinc-100 mt-1 focus:border-zinc-700 outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          )}

          {/* ANNOUNCEMENT FORM */}
          {item.type === "announcements" && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-zinc-500">Title</label>
                <input type="text" value={formData.title || ""} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded p-1.5 text-xs text-zinc-100 mt-1 focus:border-zinc-700 outline-none" />
              </div>
              <div>
                <label className="text-[11px] text-zinc-500">Content / Message</label>
                <textarea value={formData.content || ""} onChange={e => setFormData({ ...formData, content: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded p-1.5 text-xs text-zinc-100 mt-1 h-20 focus:border-zinc-700 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-zinc-500">Audience</label>
                  <select value={formData.audience_type || "all"} onChange={e => setFormData({ ...formData, audience_type: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded p-1.5 text-xs text-zinc-100 mt-1 focus:border-zinc-700 outline-none">
                    <option value="all">All Users</option>
                    <option value="students">Students</option>
                    <option value="professors">Professors</option>
                    <option value="course">Course</option>
                    <option value="team">Team</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-zinc-500">Priority</label>
                  <select value={formData.priority || "normal"} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded p-1.5 text-xs text-zinc-100 mt-1 focus:border-zinc-700 outline-none">
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Relations Inspector */}
        <div className="space-y-3 pt-2 border-t border-zinc-900">
          <div className="flex items-center gap-1 text-zinc-400">
            <LinkIcon className="w-3 h-3" />
            <span className="text-xs font-semibold uppercase tracking-wider">Relations / Linked Data</span>
          </div>

          {fetchingRelations ? (
            <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-zinc-700" /></div>
          ) : (
            <div className="space-y-2">
              {(relations.courses?.length > 0) && (
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500">Courses Enrolled:</span>
                  {relations.courses.map((m: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-zinc-900/30 p-1.5 rounded border border-zinc-900/50">
                      <span className="truncate text-zinc-300">{m.courses?.name}</span>
                    </div>
                  ))}
                </div>
              )}
              {(relations.teams?.length > 0) && (
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500">Teams Joined:</span>
                  {relations.teams.map((m: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-zinc-900/30 p-1.5 rounded border border-zinc-900/50">
                      <span className="truncate text-zinc-300">{m.teams?.name || m.name}</span>
                    </div>
                  ))}
                </div>
              )}
              {(relations.students?.length > 0) && (
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500">Enrolled Students:</span>
                  {relations.students.map((m: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-zinc-900/30 p-1.5 rounded border border-zinc-900/50">
                      <span className="truncate text-zinc-300">{m.profiles?.first_name} {m.profiles?.last_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-zinc-900 bg-[#0B0B0B] flex items-center justify-between gap-3">
        <button onClick={handleDelete} disabled={loading} className="p-2 border border-red-900/30 bg-red-950/20 text-red-500 rounded-md hover:bg-red-950/40 opacity-80 hover:opacity-100 transition disabled:opacity-50">
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-2 flex-1">
          <button onClick={onClose} className="flex-1 border border-zinc-800 text-zinc-400 bg-zinc-900/50 px-3 py-1.5 rounded-md text-xs hover:border-zinc-700 hover:text-zinc-200 transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading} className="flex-1 bg-white hover:bg-zinc-200 text-black px-3 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
