"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Calendar,
  Clock,
  Loader2,
  Plus,
  Search,
  Users,
  CheckCircle2,
  MessageSquare,
  X,
  Flag,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";

interface ThesisCard {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string | null;
  studentName: string;
  progress: number;
  milestoneCount: number;
  approvedCount: number;
  messageCount: number;
}

const STATUS_FILTERS = ["All", "Proposal", "In Progress", "Under Review", "Completed"];

function normalizeStatus(status: string): string {
  const s = status?.toLowerCase();
  if (s === "research" || s === "writing" || s === "in_progress") return "In Progress";
  if (s === "review" || s === "under review") return "Under Review";
  if (s === "proposal") return "Proposal";
  if (s === "completed") return "Completed";
  return status;
}

function StatusBadge({ status }: { status: string }) {
  const n = normalizeStatus(status);
  if (n === "Completed")
    return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">Completed</span>;
  if (n === "Proposal")
    return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">Proposal</span>;
  if (n === "Under Review")
    return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20">Under Review</span>;
  if (n === "In Progress")
    return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">In Progress</span>;
  return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-white/10">{status || "Unknown"}</span>;
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function progressBarColor(p: number) {
  if (p === 0) return "bg-gray-200";
  if (p >= 75) return "bg-emerald-500";
  if (p >= 40) return "bg-violet-500";
  return "bg-blue-400";
}

const STATUS_OPTIONS = ["proposal", "research", "writing", "review", "completed"];

export default function SupervisorThesisDashboardClient({
  supervisorName,
  theses,
}: {
  supervisorName: string;
  theses: ThesisCard[];
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editThesis, setEditThesis] = useState<ThesisCard | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ThesisCard | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  function openEdit(t: ThesisCard) {
    setEditThesis(t);
    setEditTitle(t.title);
    setEditDescription(t.description || "");
    setEditDeadline(t.deadline || "");
    setEditStatus(t.status);
    setEditError(null);
    setOpenMenuId(null);
  }

  function closeEdit() {
    setEditThesis(null);
    setEditError(null);
  }

  async function handleEdit(e: FormEvent) {
    e.preventDefault();
    if (!editThesis || !editTitle.trim()) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      const res = await fetch(`/professor/thesis/${editThesis.id}/api`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          deadline: editDeadline || null,
          status: editStatus,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setEditError(data?.error || "Could not update thesis.");
      } else {
        closeEdit();
        router.refresh();
      }
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      const res = await fetch(`/professor/thesis/${deleteTarget.id}/api`, { method: "DELETE" });
      if (res.ok) {
        setDeleteTarget(null);
        router.refresh();
      }
    } finally {
      setDeleteSubmitting(false);
    }
  }

  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [showModal]);

  function closeModal() {
    setShowModal(false);
    setStudentEmail("");
    setTitle("");
    setDescription("");
    setDeadline("");
    setError(null);
  }

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!studentEmail || !title) {
      setError("Student email and thesis title are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/professor/thesis/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentEmail, title, description, deadline: deadline || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Could not create thesis.");
      } else {
        closeModal();
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const totalTheses = theses.length;
  const inProgressCount = theses.filter((t) => normalizeStatus(t.status) === "In Progress").length;
  const underReviewCount = theses.filter((t) => normalizeStatus(t.status) === "Under Review").length;
  const studentCount = new Set(theses.map((t) => t.studentName)).size;

  const filtered = theses.filter((t) => {
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.studentName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "All" || normalizeStatus(t.status) === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
            Thesis Collab · Supervisor View
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight">
            Thesis Supervision
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Track progress, review milestones, and keep structured supervision records.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 text-sm font-medium px-4 py-2.5 rounded-xl transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Thesis
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: totalTheses, icon: FileText, color: "text-gray-500 dark:text-zinc-400", bg: "bg-gray-100 dark:bg-white/5" },
          { label: "In Progress", value: inProgressCount, icon: Clock, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { label: "Under Review", value: underReviewCount, icon: CheckCircle2, color: "text-violet-500 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-500/10" },
          { label: "Students", value: studentCount, icon: Users, color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/10 p-4 transition-colors">
            <div className={`inline-flex p-2 rounded-lg ${bg} mb-3 transition-colors`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{value}</p>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search by title or student..."
            className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 bg-white dark:bg-[#111111] text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeFilter === f
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "border border-gray-200 dark:border-white/10 text-gray-600 dark:text-zinc-400 hover:border-gray-400 dark:hover:border-zinc-500 bg-white dark:bg-[#111111]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Thesis Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
            {activeFilter === "All" ? "All Theses" : activeFilter}
          </h2>
          <p className="text-xs text-gray-400 dark:text-zinc-500">
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/10 p-16 text-center transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">No theses found.</p>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
              {search || activeFilter !== "All" ? "Try adjusting your filters." : "Create your first thesis to get started."}
            </p>
          </div>        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((t, i) => {
              const initials = getInitials(t.studentName);
              const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <div
                  key={t.id}
                  className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/10 p-5 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-md transition group relative"
                >
                  {/* Top row: avatar + name + menu */}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor} dark:bg-white/10 dark:text-zinc-200`}>
                      {initials}
                    </div>
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => router.push(`/professor/thesis/${t.id}`)}
                    >
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
                        {t.title || "Untitled"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">{t.studentName}</p>
                    </div>
                    <div className="relative shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === t.id ? null : t.id);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenuId === t.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-8 z-20 w-44 bg-white dark:bg-[#1A1A1A] rounded-xl shadow-lg border border-gray-100 dark:border-white/10 py-1 overflow-hidden">
                            <button
                              onClick={() => { setOpenMenuId(null); router.push(`/professor/thesis/${t.id}`); }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                              View Details
                            </button>
                            <button
                              onClick={() => openEdit(t)}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                            >
                              <Pencil className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                              Edit
                            </button>
                            <div className="my-1 border-t border-gray-100 dark:border-white/10" />
                            <button
                              onClick={() => { setOpenMenuId(null); setDeleteTarget(t); }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Clickable body */}
                  <div
                    className="cursor-pointer"
                    onClick={() => router.push(`/professor/thesis/${t.id}`)}
                  >
                    {/* Description */}
                    {t.description && (
                      <p className="text-xs text-gray-400 dark:text-zinc-500 mt-3 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    )}

                    {/* Badges row */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <StatusBadge status={t.status} />
                      {t.deadline && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-0.5 rounded-full">
                          <Flag className="w-2.5 h-2.5" />
                          {t.deadline}
                        </span>
                      )}
                      {t.messageCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-0.5 rounded-full">
                          <MessageSquare className="w-2.5 h-2.5" />
                          {t.messageCount}
                        </span>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                          Progress
                        </span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300 tabular-nums">
                          {t.approvedCount}/{t.milestoneCount} milestones · {t.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all ${progressBarColor(t.progress)}`}
                          style={{ width: `${t.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Thesis Modal */}
      {editThesis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={closeEdit} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/5">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Edit Thesis</h2>
                <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">Update thesis details</p>
              </div>
              <button onClick={closeEdit} className="p-1.5 rounded-lg text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/10 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wide">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-zinc-100 transition"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea
                  rows={3}
                  className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-zinc-100 transition resize-none"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wide">Status</label>
                <select
                  className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-zinc-100 transition"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wide">Deadline</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" />
                  <input
                    type="date"
                    className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-zinc-100 transition dark:[color-scheme:dark]"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                  />
                </div>
              </div>
              {editError && (
                <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">{editError}</div>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeEdit} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting || !editTitle.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium disabled:opacity-50 hover:bg-gray-800 dark:hover:bg-gray-200 transition"
                >
                  {editSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
            <div className="px-6 py-6">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
                <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
              </div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Delete Thesis?</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                <span className="font-medium text-gray-700 dark:text-zinc-200">"{deleteTarget.title}"</span> will be permanently deleted along with all its milestones and comments. This cannot be undone.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 dark:bg-red-500/80 text-white text-sm font-medium disabled:opacity-50 hover:bg-red-700 dark:hover:bg-red-500 transition"
                >
                  {deleteSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Thesis Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/5">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Create New Thesis</h2>
                <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">Assign a thesis project to a student</p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wide">
                  Student Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="student@university.edu"
                  className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-zinc-100 transition placeholder-gray-400 dark:placeholder-zinc-500"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wide">
                  Thesis Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Federated Learning in Healthcare"
                  className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-zinc-100 transition placeholder-gray-400 dark:placeholder-zinc-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wide">
                  Description
                  <span className="text-gray-400 dark:text-zinc-500 font-normal normal-case tracking-normal ml-1">(optional)</span>
                </label>
                <textarea
                  placeholder="Brief description of the thesis topic..."
                  rows={3}
                  className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-zinc-100 transition placeholder-gray-400 dark:placeholder-zinc-500 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wide">
                  Final Deadline
                  <span className="text-gray-400 dark:text-zinc-500 font-normal normal-case tracking-normal ml-1">(optional)</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" />
                  <input
                    type="date"
                    className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-zinc-100 transition dark:[color-scheme:dark]"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !studentEmail.trim() || !title.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium disabled:opacity-50 hover:bg-gray-800 dark:hover:bg-gray-200 transition"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Thesis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
