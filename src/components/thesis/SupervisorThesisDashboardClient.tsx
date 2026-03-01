"use client";

import Link from "next/link";
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
  ChevronRight,
  Flag,
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
    return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>;
  if (n === "Proposal")
    return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Proposal</span>;
  if (n === "Under Review")
    return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">Under Review</span>;
  if (n === "In Progress")
    return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">In Progress</span>;
  return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">{status || "Unknown"}</span>;
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
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Thesis Collab · Supervisor View
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">
            Thesis Supervision
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track progress, review milestones, and keep structured supervision records.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Thesis
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: totalTheses, icon: FileText, color: "text-gray-500", bg: "bg-gray-100" },
          { label: "In Progress", value: inProgressCount, icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Under Review", value: underReviewCount, icon: CheckCircle2, color: "text-violet-500", bg: "bg-violet-50" },
          { label: "Students", value: studentCount, icon: Users, color: "text-emerald-500", bg: "bg-emerald-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or student..."
            className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeFilter === f
                  ? "bg-gray-900 text-white"
                  : "border border-gray-200 text-gray-600 hover:border-gray-400 bg-white"
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
          <h2 className="text-sm font-semibold text-gray-700">
            {activeFilter === "All" ? "All Theses" : activeFilter}
          </h2>
          <p className="text-xs text-gray-400">
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">No theses found.</p>
            <p className="text-xs text-gray-400 mt-1">
              {search || activeFilter !== "All" ? "Try adjusting your filters." : "Create your first thesis to get started."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((t, i) => {
              const initials = getInitials(t.studentName);
              const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <Link
                  key={t.id}
                  href={`/professor/thesis/${t.id}`}
                  className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition group block"
                >
                  {/* Top row: avatar + name + status + arrow */}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor}`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                            {t.title || "Untitled"}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{t.studentName}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition shrink-0 mt-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {t.description && (
                    <p className="text-xs text-gray-400 mt-3 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  )}

                  {/* Badges row */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <StatusBadge status={t.status} />
                    {t.deadline && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                        <Flag className="w-2.5 h-2.5" />
                        {t.deadline}
                      </span>
                    )}
                    {t.messageCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                        <MessageSquare className="w-2.5 h-2.5" />
                        {t.messageCount}
                      </span>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                        Progress
                      </span>
                      <span className="text-xs font-semibold text-gray-700 tabular-nums">
                        {t.approvedCount}/{t.milestoneCount} milestones · {t.progress}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${progressBarColor(t.progress)}`}
                        style={{ width: `${t.progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Thesis Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Create New Thesis</h2>
                <p className="text-xs text-gray-500 mt-0.5">Assign a thesis project to a student</p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Student Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="student@university.edu"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50 transition"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Thesis Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Federated Learning in Healthcare"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50 transition"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Description
                  <span className="text-gray-400 font-normal normal-case tracking-normal ml-1">(optional)</span>
                </label>
                <textarea
                  placeholder="Brief description of the thesis topic..."
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50 transition resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Final Deadline
                  <span className="text-gray-400 font-normal normal-case tracking-normal ml-1">(optional)</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50 transition"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !studentEmail.trim() || !title.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-50 hover:bg-gray-800 transition"
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
