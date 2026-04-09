"use client";

import { useMemo, useState, useEffect } from "react";
import MeetingsTab, { Meeting } from "./MeetingsTab";
import {
  Calendar,
  CheckCircle2,
  Video,
  Clock,
  FileText,
  MessageCircle,
  Plus,
  Loader2,
  Flag,
  MoreHorizontal,
  AlertCircle,
  X,
  Send,
  BookOpen,
  Download,
  StickyNote,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Avatar from "../ui/Avatar";

interface Thesis {
  id: string;
  title: string;
  description: string;
  status: string;
  start_date: string | null;
  deadline: string | null;
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string | null;
  } | null;
  supervisor?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

interface Milestone {
  id: string;
  thesis_id: string;
  title: string;
  description: string;
  due_date: string | null;
  status: string;
  supervisor_feedback: string | null;
  created_at: string;
}

interface Submission {
  id: string;
  milestone_id: string;
  version_number: number;
  file_name: string;
  file_url: string;
  uploaded_by: string;
  created_at: string;
}

interface Comment {
  id: string;
  thesis_id: string;
  author_id: string;
  author_role: "student" | "supervisor";
  content: string;
  created_at: string;
  author?: { id: string; first_name: string; last_name: string; email?: string | null; avatar_url?: string | null } | null;
}

interface Draft {
  id: string;
  thesis_id: string;
  uploaded_by: string;
  version_number: number;
  file_path: string;
  file_url: string;
  file_name: string;
  uploaded_at: string;
  student_note: string | null;
}

type Tab = "milestones" | "thread" | "details" | "drafts" | "meetings";

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === "completed")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3" />
        Completed
      </span>
    );
  if (s === "proposal")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
        Proposal
      </span>
    );
  if (s === "review" || s === "under review")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20">
        Under Review
      </span>
    );
  if (s === "research" || s === "writing" || s === "in_progress")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
        In Progress
      </span>
    );
  if (s === "rejected")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
        <AlertCircle className="w-3 h-3" />
        Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-white/10">
      {status || "Unknown"}
    </span>
  );
}

function MilestoneStatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === "approved")
    return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">Approved</span>;
  if (s === "submitted")
    return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">Submitted</span>;
  if (s === "rejected")
    return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">Rejected</span>;
  return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-white/10">{status || "Pending"}</span>;
}

const AVATAR_COLORS = [
  "bg-violet-500","bg-blue-500","bg-emerald-500","bg-orange-500",
  "bg-rose-500","bg-cyan-500","bg-amber-500","bg-fuchsia-500",
];

function getAvatarColor(userId: string) {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = userId.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function getInitials(firstName?: string | null, lastName?: string | null, email?: string | null) {
  const f = firstName?.trim()[0] ?? "";
  const l = lastName?.trim()[0] ?? "";
  if (f || l) return (f + l).toUpperCase();
  if (email) return email[0].toUpperCase();
  return "U";
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function resolveDisplayName(firstName?: string | null, lastName?: string | null, email?: string | null, fallback = "Unknown") {
  const full = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  if (full) return full;
  if (email) return email;
  return fallback;
}

export default function SupervisorThesisDetailClient({
  supervisorName,
  supervisorAvatarUrl,
  thesis,
  milestones,
  submissions,
  comments,
  drafts,
  meetings,
}: {
  supervisorName: string;
  supervisorAvatarUrl?: string | null;
  thesis: Thesis;
  milestones: Milestone[];
  submissions: Submission[];
  comments: Comment[];
  drafts: Draft[];
  meetings: Meeting[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("milestones");
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({});
  const [savingMilestoneId, setSavingMilestoneId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!showMilestoneModal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeMilestoneModal(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [showMilestoneModal]);

  function closeMilestoneModal() {
    setShowMilestoneModal(false);
    setNewTitle("");
    setNewDueDate("");
    setNewDescription("");
  }

  const submissionsByMilestone = useMemo(() => {
    const map: Record<string, Submission[]> = {};
    submissions.forEach((s) => {
      if (!map[s.milestone_id]) map[s.milestone_id] = [];
      map[s.milestone_id].push(s);
    });
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    );
    return map;
  }, [submissions]);

  const completedMilestones = milestones.filter((m) => m.status === "approved").length;
  const progress = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

  const studentInitials = getInitials(thesis.student?.first_name, thesis.student?.last_name, thesis.student?.email);
  const studentFullName = resolveDisplayName(thesis.student?.first_name, thesis.student?.last_name, thesis.student?.email, "Unknown Student");

  async function handleUpdateMilestoneStatus(milestoneId: string, status: "approved" | "rejected") {
    setSavingMilestoneId(milestoneId);
    try {
      const res = await fetch("/supervisor/thesis/milestone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, status, feedback: feedbackDrafts[milestoneId] ?? null }),
      });
      if (res.ok) router.refresh();
    } finally {
      setSavingMilestoneId(null);
    }
  }

  async function handleCreateMilestone() {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/supervisor/thesis/milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thesisId: thesis.id,
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          dueDate: newDueDate || null,
        }),
      });
      if (res.ok) {
        closeMilestoneModal();
        router.refresh();
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleAddComment() {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch("/student/thesis/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thesisId: thesis.id, content: commentText.trim() }),
      });
      if (res.ok) {
        setCommentText("");
        router.refresh();
      }
    } finally {
      setSubmittingComment(false);
      const ta = document.getElementById("supervisor-chat-input") as HTMLTextAreaElement;
      if (ta) ta.style.height = "auto";
    }
  }

  const groupedComments: { date: string; messages: Comment[] }[] = [];
  comments.forEach((msg) => {
    const label = formatDateLabel(msg.created_at);
    const last = groupedComments[groupedComments.length - 1];
    if (!last || last.date !== label) groupedComments.push({ date: label, messages: [msg] });
    else last.messages.push(msg);
  });

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const tabs: { id: Tab; label: string; icon: typeof FileText | typeof Video; count?: number }[] = [
    { id: "milestones", label: "Milestones", icon: FileText },
    { id: "drafts", label: "Drafts", icon: BookOpen, count: drafts.length },
    { id: "thread", label: "Supervision Thread", icon: MessageCircle, count: comments.length },
    { id: "meetings", label: "Meetings", icon: Video, count: meetings.length },
    { id: "details", label: "Details", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/10 p-6 transition-colors">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
              Supervision · {supervisorName}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight">
              {thesis.title || "Untitled Thesis"}
            </h1>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition text-gray-400 dark:text-zinc-500 shrink-0">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <StatusBadge status={thesis.status} />
          {thesis.deadline && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1 rounded-full">
              <Flag className="w-3 h-3" />
              Final Deadline: {thesis.deadline}
            </span>
          )}
        </div>

        {/* Student info + Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-gray-50 dark:bg-white/5 rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-[#111111] text-gray-700 dark:text-zinc-300 flex items-center justify-center text-sm font-bold shrink-0">
              {studentInitials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{studentFullName}</p>
              {thesis.student?.email && (
                <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">{thesis.student.email}</p>
              )}
              {thesis.description && (
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 leading-relaxed">{thesis.description}</p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
              Progress
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{progress}%</p>
            <div className="mt-3 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-gray-900 dark:bg-white transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2">
              {completedMilestones} of {milestones.length} milestones done
            </p>
          </div>
        </div>
      </div>

      {/* Pill tab bar */}
      <div className="flex gap-1 bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/10 p-1 transition-colors">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-4 h-4 shrink-0" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20 dark:bg-gray-900/20 text-white dark:text-gray-900" : "bg-gray-100 dark:bg-[#111111] text-gray-600 dark:text-zinc-400"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* MILESTONES TAB */}
      {activeTab === "milestones" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Project Milestones</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                Track deliverables and grade submissions.
              </p>
            </div>
            <button
              onClick={() => setShowMilestoneModal(true)}
              className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              New Milestone
            </button>
          </div>

          {milestones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-gray-50/50 dark:bg-[#111111]">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-gray-400 dark:text-zinc-500" />
              </div>
              <h4 className="text-sm font-bold text-gray-700 dark:text-zinc-300">No milestones structured yet</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Add milestones to help your student plan their thesis work and deliver progress incrementally.
              </p>
            </div>
          ) : (
            <div className="relative pl-4 space-y-8">
              <div className="absolute left-[31px] top-4 bottom-4 w-px bg-gray-200 dark:bg-white/10" />

              {milestones.map((m, index) => {
                const mSubmissions = submissionsByMilestone[m.id] ?? [];
                const latest = mSubmissions[0];
                const isApproved = m.status === "approved";
                const isRejected = m.status === "rejected";

                return (
                  <div key={m.id} className="relative flex gap-6 group">
                    <div className="shrink-0 mt-1 z-10">
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[11px] font-bold bg-white dark:bg-[#111111] transition-all duration-300 group-hover:scale-110 shadow-sm ${
                          isApproved
                            ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-50 dark:ring-emerald-500/10"
                            : isRejected
                            ? "border-red-400 text-red-500 dark:text-red-400 ring-4 ring-red-50 dark:ring-red-500/10"
                            : "border-gray-900 dark:border-white text-gray-900 dark:text-white ring-4 ring-gray-50 dark:ring-white/5"
                        }`}
                      >
                        {isApproved ? <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : index + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 bg-white dark:bg-[#111111] border border-gray-100/80 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap mb-1.5">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">{m.title}</h3>
                            <MilestoneStatusBadge status={m.status} />
                          </div>
                          
                          {m.due_date && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-white/5 text-[11px] font-semibold text-gray-500 dark:text-zinc-400 mb-3">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Due {new Date(m.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                            </div>
                          )}
                          
                          {m.description && (
                            <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed max-w-2xl">{m.description}</p>
                          )}
                        </div>

                        {latest && (
                          <div className="shrink-0">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                              <FileText className="w-3.5 h-3.5" />
                              Submission Received
                            </span>
                          </div>
                        )}
                      </div>

                      {latest && (
                        <div className="mt-5 border-t border-gray-100 dark:border-white/10 pt-5">
                          {/* Review Dock */}
                          <div className="bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-3">Supervisor Review Dock</h4>
                            
                            <div className="flex flex-col md:flex-row gap-4">
                              <div className="flex-1">
                                <textarea
                                  value={feedbackDrafts[m.id] ?? m.supervisor_feedback ?? ""}
                                  onChange={(e) => setFeedbackDrafts((prev) => ({ ...prev, [m.id]: e.target.value }))}
                                  rows={2}
                                  className="w-full text-sm placeholder-gray-400 dark:placeholder-zinc-500 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 bg-white dark:bg-[#111111] text-gray-900 dark:text-zinc-100 transition-shadow"
                                  placeholder="Provide actionable feedback or summary of your decision..."
                                />
                              </div>
                              <div className="shrink-0 flex flex-col gap-2 w-full md:w-32">
                                <button
                                  onClick={() => handleUpdateMilestoneStatus(m.id, "approved")}
                                  disabled={savingMilestoneId === m.id}
                                  className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateMilestoneStatus(m.id, "rejected")}
                                  disabled={savingMilestoneId === m.id}
                                  className="w-full inline-flex items-center justify-center gap-1.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                                >
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>

                          {mSubmissions.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {mSubmissions.map((s, idx) => (
                                <div key={s.id} className="flex items-center justify-between group/sub transition-colors hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg px-2 py-1.5 -mx-2">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/5 flex items-center justify-center shrink-0 group-hover/sub:bg-white dark:group-hover/sub:bg-white/10 transition-colors">
                                      <FileText className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
                                    </div>
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-900 dark:text-zinc-200">{s.file_name}</span>
                                        <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded-md">v{s.version_number}</span>
                                        {idx === 0 && <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Latest</span>}
                                      </div>
                                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">Delivered {new Date(s.created_at).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                  <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="shrink-0 p-2 text-gray-400 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors tooltip" title="Download Source">
                                    <Download className="w-4 h-4" />
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* DRAFTS TAB */}
      {activeTab === "drafts" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Student Drafts</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                Full thesis draft versions submitted by the student.
              </p>
            </div>
            {drafts.length > 0 && (
              <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10">
                {drafts.length} version{drafts.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-gray-50/50 dark:bg-[#111111]">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-gray-400 dark:text-zinc-500" />
              </div>
              <h4 className="text-sm font-bold text-gray-700 dark:text-zinc-300">No drafts uploaded yet</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                The student hasn&apos;t submitted any thesis drafts yet. When they do, you can review them here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {drafts
                .slice()
                .sort((a, b) => b.version_number - a.version_number)
                .map((d, idx) => (
                  <div
                    key={d.id}
                    className="group relative flex flex-col bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-white/10 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-[#111111] text-white flex items-center justify-center text-sm font-bold shadow-sm transition-transform group-hover:scale-105">
                        v{d.version_number}
                      </div>
                      {idx === 0 && (
                        <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          Latest
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5 line-clamp-1" title={d.file_name}>
                        {d.file_name}
                      </h4>
                      <p className="text-[11px] font-medium text-gray-400 dark:text-zinc-500">
                        Uploaded {new Date(d.uploaded_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                      
                      {d.student_note && (
                        <div className="mt-4 flex items-start gap-2 bg-amber-50/50 dark:bg-amber-500/10 border border-amber-100/50 dark:border-amber-500/20 rounded-lg p-3">
                          <StickyNote className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-900 dark:text-amber-200 italic leading-relaxed line-clamp-3">
                            {d.student_note}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-50 dark:border-white/5 flex justify-end">
                      <a
                        href={d.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-zinc-300 bg-gray-50 dark:bg-white/5 hover:bg-gray-900 hover:text-white dark:hover:bg-white/10 dark:hover:text-white transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* THREAD TAB */}
      {activeTab === "thread" && (
        <div className="flex flex-col h-[600px] max-w-4xl mx-auto w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100/50 dark:border-white/5 rounded-2xl p-4 lg:p-6 shadow-sm">
          
          {/* Message Feed */}
          <div className="flex-1 overflow-y-auto pr-2 flex flex-col-reverse">
            <div className="flex flex-col justify-end pb-4">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-[#111111] border border-gray-100 dark:border-white/5 flex items-center justify-center text-xl">
                    💬
                  </div>
                  <p className="text-gray-500 dark:text-zinc-400 text-sm font-medium">No messages yet</p>
                  <p className="text-gray-400 dark:text-zinc-500 text-xs">Be the first to say something!</p>
                </div>
              ) : (
                groupedComments.map(({ date, messages: dayMsgs }) => (
                  <div key={date}>
                    <div className="flex items-center gap-3 my-5">
                      <div className="flex-1 h-px bg-gray-100 dark:bg-white/10" />
                      <span className="text-[10px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-widest shrink-0">
                        {date}
                      </span>
                      <div className="flex-1 h-px bg-gray-100 dark:bg-white/10" />
                    </div>

                    <div className="space-y-0.5">
                      {dayMsgs.map((msg, idx) => {
                        const isOwn = msg.author_role === "supervisor";
                        const authorName = msg.author?.first_name
                          ? msg.author.first_name
                          : (isOwn ? supervisorName : resolveDisplayName(msg.author?.first_name, msg.author?.last_name, msg.author?.email ?? thesis.student?.email, studentFullName));
                        
                        const authorAvatar = isOwn ? supervisorAvatarUrl : msg.author?.avatar_url;
                        
                        const prevMsg = dayMsgs[idx - 1];
                        const isSameSender = prevMsg?.author_role === msg.author_role;
                        const showMeta = !isSameSender;

                        const textLines = msg.content.split("\n").filter(l => l.trim());

                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : "flex-row"} ${showMeta ? "mt-5" : "mt-0.5"}`}
                          >
                            <div className="shrink-0 w-8 flex flex-col items-center">
                              {showMeta && (
                                <Avatar name={authorName} avatarUrl={authorAvatar} size={32} />
                              )}
                            </div>

                            <div className={`flex flex-col max-w-[80%] ${isOwn ? "items-end" : "items-start"}`}>
                              {showMeta && (
                                <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                                  <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200">{authorName}{isOwn && " (You)"}</span>
                                  <span className="text-[10px] text-gray-400 dark:text-zinc-500">{formatTime(msg.created_at)}</span>
                                </div>
                              )}

                              {textLines.length > 0 && (
                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                                  isOwn
                                    ? "bg-gray-900 text-white dark:bg-white/10 dark:text-zinc-100 rounded-tr-sm"
                                    : "bg-white text-gray-800 border border-gray-100 dark:border-white/5 dark:bg-white/5 dark:text-zinc-200 rounded-tl-sm shadow-sm"
                                }`}>
                                  {textLines.map((line, i) => <p key={i}>{line}</p>)}
                                </div>
                              )}

                              {!showMeta && (
                                <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5 px-1 opacity-0 hover:opacity-100 transition-opacity">{formatTime(msg.created_at)}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Input */}
          <div className="shrink-0 pt-4 mt-4 border-t border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-2xl px-3 py-2 focus-within:border-gray-400 dark:focus-within:border-white/30 focus-within:bg-white dark:focus-within:bg-[#1A1A1A] transition">
              <textarea
                id="supervisor-chat-input"
                rows={1}
                value={commentText}
                onChange={autoResize}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                placeholder="Message Thread..."
                className="flex-1 bg-transparent text-sm resize-none focus:outline-none text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 leading-relaxed overflow-y-auto self-center pl-2"
                style={{ maxHeight: 120 }}
              />

              <div className="flex-none flex items-center gap-1">
                <button
                  onClick={handleAddComment}
                  disabled={submittingComment || !commentText.trim()}
                  className="w-8 h-8 flex items-center justify-center bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 text-white dark:text-gray-900 rounded-xl transition"
                >
                  {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send size={14} className="ml-0.5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2 px-1">
               <p className="text-[10px] text-gray-400 dark:text-zinc-600 select-none">
                 Enter to send · Shift+Enter for new line
               </p>
            </div>
          </div>

        </div>
      )}

      {/* DETAILS TAB */}
      {activeTab === "details" && (
        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/10 p-6 transition-colors">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Thesis Details</h2>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-1">Title</p>
              <p className="text-gray-900 dark:text-zinc-100">{thesis.title || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-1">Description</p>
              <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">{thesis.description || "No description provided."}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-1">Status</p>
                <StatusBadge status={thesis.status} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-1">Final Deadline</p>
                <p className="text-gray-700 dark:text-zinc-300">
                  {thesis.deadline
                    ? new Date(thesis.deadline).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                    : "—"}
                </p>
              </div>
              {thesis.student && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Student</p>
                  <p className="text-gray-700">{studentFullName}</p>
                  {thesis.student.email && <p className="text-xs text-gray-400 mt-0.5">{thesis.student.email}</p>}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Milestones</p>
                <p className="text-gray-700">{completedMilestones} / {milestones.length} approved</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEETINGS TAB */}
      {activeTab === "meetings" && (
        <div className="animation-fade-in">
          <MeetingsTab
            role="professor"
            thesisId={thesis.id}
            meetings={meetings}
            professorId={thesis.supervisor?.id}
            participantName={studentFullName}
          />
        </div>
      )}

      {/* Add Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={closeMilestoneModal} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/5">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Add Milestone</h2>
                <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">Define a new milestone for this thesis</p>
              </div>
              <button onClick={closeMilestoneModal} className="p-1.5 rounded-lg text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/10 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wide">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Literature Review"
                  className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-zinc-100 transition placeholder-gray-400 dark:placeholder-zinc-600"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wide">
                  Due Date
                  <span className="text-gray-400 dark:text-zinc-600 font-normal normal-case tracking-normal ml-1">(optional)</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" />
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-zinc-100 transition dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wide">
                  Description
                  <span className="text-gray-400 dark:text-zinc-600 font-normal normal-case tracking-normal ml-1">(optional)</span>
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  placeholder="What should the student deliver for this milestone?"
                  className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-zinc-100 transition placeholder-gray-400 dark:placeholder-zinc-600 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeMilestoneModal}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMilestone}
                  disabled={creating || !newTitle.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium disabled:opacity-50 hover:bg-gray-800 dark:hover:bg-gray-200 transition"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Milestone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
