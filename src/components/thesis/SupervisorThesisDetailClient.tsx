"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle2,
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
  author?: { id: string; first_name: string; last_name: string; email?: string | null } | null;
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

type Tab = "milestones" | "thread" | "details" | "drafts";

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === "completed")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" />
        Completed
      </span>
    );
  if (s === "proposal")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        Proposal
      </span>
    );
  if (s === "review" || s === "under review")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
        Under Review
      </span>
    );
  if (s === "research" || s === "writing" || s === "in_progress")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        In Progress
      </span>
    );
  if (s === "rejected")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
        <AlertCircle className="w-3 h-3" />
        Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
      {status || "Unknown"}
    </span>
  );
}

function MilestoneStatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === "approved")
    return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>;
  if (s === "submitted")
    return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Submitted</span>;
  if (s === "rejected")
    return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200">Rejected</span>;
  return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">{status || "Pending"}</span>;
}

function getInitials(firstName?: string | null, lastName?: string | null, email?: string | null) {
  const f = firstName?.trim()[0] ?? "";
  const l = lastName?.trim()[0] ?? "";
  if (f || l) return (f + l).toUpperCase();
  if (email) return email[0].toUpperCase();
  return "?";
}

function resolveDisplayName(firstName?: string | null, lastName?: string | null, email?: string | null, fallback = "Unknown") {
  const full = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  if (full) return full;
  if (email) return email;
  return fallback;
}

export default function SupervisorThesisDetailClient({
  supervisorName,
  thesis,
  milestones,
  submissions,
  comments,
  drafts,
}: {
  supervisorName: string;
  thesis: Thesis;
  milestones: Milestone[];
  submissions: Submission[];
  comments: Comment[];
  drafts: Draft[];
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
    }
  }

  const tabs: { id: Tab; label: string; icon: typeof FileText; count?: number }[] = [
    { id: "milestones", label: "Milestones", icon: FileText },
    { id: "drafts", label: "Drafts", icon: BookOpen, count: drafts.length },
    { id: "thread", label: "Supervision Thread", icon: MessageCircle, count: comments.length },
    { id: "details", label: "Details", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Supervision · {supervisorName}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">
              {thesis.title || "Untitled Thesis"}
            </h1>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-400 shrink-0">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <StatusBadge status={thesis.status} />
          {thesis.deadline && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <Flag className="w-3 h-3" />
              Final Deadline: {thesis.deadline}
            </span>
          )}
        </div>

        {/* Student info + Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-gray-50 rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-bold shrink-0">
              {studentInitials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{studentFullName}</p>
              {thesis.student?.email && (
                <p className="text-xs text-gray-500 mt-0.5">{thesis.student.email}</p>
              )}
              {thesis.description && (
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{thesis.description}</p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Progress
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{progress}%</p>
            <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-gray-800 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {completedMilestones} of {milestones.length} milestones done
            </p>
          </div>
        </div>
      </div>

      {/* Pill tab bar */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <tab.icon className="w-4 h-4 shrink-0" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* MILESTONES TAB */}
      {activeTab === "milestones" && (
        <div className="space-y-4">
          {/* Milestones list card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">Milestones</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{milestones.length} total</span>
                <button
                  onClick={() => setShowMilestoneModal(true)}
                  className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Milestone
                </button>
              </div>
            </div>

            {milestones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500">No milestones defined yet.</p>
                <p className="text-xs text-gray-400 mt-1">Add a milestone to start tracking progress.</p>
                <button
                  onClick={() => setShowMilestoneModal(true)}
                  className="mt-4 inline-flex items-center gap-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium px-4 py-2 rounded-xl transition"
                >
                  <Plus className="w-4 h-4" />
                  Add first milestone
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {milestones.map((m) => {
                  const mSubmissions = submissionsByMilestone[m.id] ?? [];
                  return (
                    <div key={m.id} className="border border-gray-100 rounded-xl p-4 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                          {m.due_date && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>Due {new Date(m.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <MilestoneStatusBadge status={m.status} />
                          <button
                            onClick={() => handleUpdateMilestoneStatus(m.id, "approved")}
                            disabled={savingMilestoneId === m.id}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition disabled:opacity-60"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateMilestoneStatus(m.id, "rejected")}
                            disabled={savingMilestoneId === m.id}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </div>
                      </div>

                      {m.description && (
                        <p className="text-xs text-gray-500">{m.description}</p>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">
                          Supervisor feedback
                        </label>
                        <textarea
                          value={feedbackDrafts[m.id] ?? m.supervisor_feedback ?? ""}
                          onChange={(e) => setFeedbackDrafts((prev) => ({ ...prev, [m.id]: e.target.value }))}
                          rows={2}
                          className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900"
                          placeholder="Summarise the decision and next steps."
                        />
                      </div>

                      {mSubmissions.length > 0 && (
                        <div className="border-t border-gray-100 pt-3 space-y-1.5">
                          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                            Submission versions
                          </p>
                          {mSubmissions.map((s, idx) => (
                            <div key={s.id} className="flex items-center justify-between text-[11px] text-gray-600">
                              <div className="flex items-center gap-2">
                                <span>v{s.version_number} · {s.file_name}</span>
                                {idx === 0 && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium">
                                    Latest
                                  </span>
                                )}
                              </div>
                              <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                Download
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DRAFTS TAB */}
      {activeTab === "drafts" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Student Drafts</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Full thesis draft versions submitted by the student.
              </p>
            </div>
            {drafts.length > 0 && (
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {drafts.length} version{drafts.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500">No drafts uploaded yet.</p>
              <p className="text-xs text-gray-400 mt-1">
                The student hasn&apos;t submitted any thesis drafts yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts
                .slice()
                .sort((a, b) => b.version_number - a.version_number)
                .map((d, idx) => (
                  <div
                    key={d.id}
                    className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="shrink-0 w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                          v{d.version_number}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900">
                              Version {d.version_number}
                            </span>
                            {idx === 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold uppercase tracking-wide">
                                Latest
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {d.file_name}&nbsp;·&nbsp;Uploaded{" "}
                            {new Date(d.uploaded_at).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          {d.student_note && (
                            <div className="mt-2 flex items-start gap-1.5">
                              <StickyNote className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                              <p className="text-xs text-gray-600 italic leading-snug">
                                {d.student_note}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <a
                        href={d.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg transition"
                      >
                        <Download className="w-3 h-3" />
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
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-900">Supervision Thread</h2>
          </div>

          <div className="p-6 space-y-3 max-h-[480px] overflow-y-auto">
            {comments.length === 0 ? (
              <div className="text-center py-10">
                <MessageCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Use this space for structured supervision notes and clarifications.</p>
              </div>
            ) : (
              comments.map((c) => {
                const isSupervisor = c.author_role === "supervisor";
                const authorName = isSupervisor
                  ? supervisorName
                  : resolveDisplayName(c.author?.first_name, c.author?.last_name, c.author?.email ?? thesis.student?.email, studentFullName);
                const initials = isSupervisor
                  ? supervisorName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
                  : getInitials(c.author?.first_name, c.author?.last_name, c.author?.email ?? thesis.student?.email);

                return (
                  <div key={c.id} className={`flex gap-3 ${isSupervisor ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isSupervisor ? "bg-gray-900 text-white" : "bg-blue-100 text-blue-700"}`}>
                      {initials}
                    </div>
                    <div className={`max-w-[75%] ${isSupervisor ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div className={`flex items-center gap-2 ${isSupervisor ? "flex-row-reverse" : ""}`}>
                        <span className="text-xs font-semibold text-gray-700">{authorName}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${isSupervisor ? "bg-gray-900 text-white rounded-tr-sm" : "bg-gray-100 text-gray-800 rounded-tl-sm"}`}>
                        {c.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-gray-100 px-6 py-4">
            <div className="flex gap-3 items-end">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                rows={2}
                placeholder="Add a supervision note or clarification..."
                className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-gray-200 bg-gray-50 transition"
              />
              <button
                onClick={handleAddComment}
                disabled={submittingComment || !commentText.trim()}
                className="p-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white rounded-xl transition shrink-0"
              >
                {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS TAB */}
      {activeTab === "details" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Thesis Details</h2>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Title</p>
              <p className="text-gray-900">{thesis.title || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Description</p>
              <p className="text-gray-700 leading-relaxed">{thesis.description || "No description provided."}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Status</p>
                <StatusBadge status={thesis.status} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Final Deadline</p>
                <p className="text-gray-700">
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

      {/* Add Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeMilestoneModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Add Milestone</h2>
                <p className="text-xs text-gray-500 mt-0.5">Define a new milestone for this thesis</p>
              </div>
              <button onClick={closeMilestoneModal} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Literature Review"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50 transition"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Due Date
                  <span className="text-gray-400 font-normal normal-case tracking-normal ml-1">(optional)</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Description
                  <span className="text-gray-400 font-normal normal-case tracking-normal ml-1">(optional)</span>
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  placeholder="What should the student deliver for this milestone?"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50 transition resize-none"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeMilestoneModal}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMilestone}
                  disabled={creating || !newTitle.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-50 hover:bg-gray-800 transition"
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
