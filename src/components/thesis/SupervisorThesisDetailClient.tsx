"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MessageCircle,
  Plus,
  Loader2,
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
}

export default function SupervisorThesisDetailClient({
  supervisorName,
  thesis,
  milestones,
  submissions,
  comments,
}: {
  supervisorName: string;
  thesis: Thesis;
  milestones: Milestone[];
  submissions: Submission[];
  comments: Comment[];
}) {
  const router = useRouter();
  const [feedbackDrafts, setFeedbackDrafts] = useState<
    Record<string, string>
  >({});
  const [savingMilestoneId, setSavingMilestoneId] = useState<string | null>(
    null
  );
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const submissionsByMilestone = useMemo(() => {
    const map: Record<string, Submission[]> = {};
    submissions.forEach((s) => {
      if (!map[s.milestone_id]) map[s.milestone_id] = [];
      map[s.milestone_id].push(s);
    });
    Object.values(map).forEach((arr) =>
      arr.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )
    );
    return map;
  }, [submissions]);

  const completedMilestones = milestones.filter(
    (m) => m.status === "approved"
  ).length;

  const progress =
    milestones.length > 0
      ? Math.round((completedMilestones / milestones.length) * 100)
      : 0;

  async function handleUpdateMilestoneStatus(
    milestoneId: string,
    status: "approved" | "rejected"
  ) {
    setSavingMilestoneId(milestoneId);
    try {
      const res = await fetch("/supervisor/thesis/milestone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId,
          status,
          feedback: feedbackDrafts[milestoneId] ?? null,
        }),
      });

      if (!res.ok) {
        console.error("Failed to update milestone");
      } else {
        router.refresh();
      }
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

      if (!res.ok) {
        console.error("Failed to create milestone");
      } else {
        setNewTitle("");
        setNewDueDate("");
        setNewDescription("");
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
        body: JSON.stringify({
          thesisId: thesis.id,
          content: commentText.trim(),
        }),
      });

      if (!res.ok) {
        console.error("Comment failed");
      } else {
        setCommentText("");
        router.refresh();
      }
    } finally {
      setSubmittingComment(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="bg-white border rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs text-slate-500">
            Supervision • {supervisorName}
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            {thesis.title || "Untitled Thesis"}
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            {thesis.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            {thesis.student && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 border border-slate-200">
                Student:{" "}
                {thesis.student.first_name}{" "}
                {thesis.student.last_name}
              </span>
            )}
            <StatusBadge status={thesis.status} />
            {thesis.deadline && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                <Clock className="w-3 h-3" />
                Final Deadline:{" "}
                {new Date(thesis.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-2 rounded-full bg-indigo-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            {completedMilestones} of {milestones.length} milestones
            approved
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Milestones + versions */}
        <div className="lg:col-span-2 space-y-6">
          {/* New Milestone */}
          <div className="bg-white border rounded-2xl shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Plus className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">
                Add Milestone
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Milestone title"
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <input
                value={newDescription}
                onChange={(e) =>
                  setNewDescription(e.target.value)
                }
                placeholder="Short description (optional)"
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCreateMilestone}
                disabled={creating || !newTitle.trim()}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs disabled:opacity-60"
              >
                {creating && (
                  <Loader2 className="w-3 h-3 animate-spin" />
                )}
                Create milestone
              </button>
            </div>
          </div>

          {/* Milestones list */}
          <div className="bg-white border rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">
                Milestones
              </h2>
            </div>

            {milestones.length === 0 ? (
              <p className="text-sm text-slate-500">
                No milestones defined yet. Use the form above to add
                the first one.
              </p>
            ) : (
              <div className="space-y-4">
                {milestones.map((m) => {
                  const mSubmissions =
                    submissionsByMilestone[m.id] ?? [];

                  return (
                    <div
                      key={m.id}
                      className="border border-slate-100 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {m.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            {m.due_date && (
                              <>
                                <Calendar className="w-3 h-3" />
                                <span>
                                  Due{" "}
                                  {new Date(
                                    m.due_date
                                  ).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <StatusBadge status={m.status} />

                          <button
                            onClick={() =>
                              handleUpdateMilestoneStatus(
                                m.id,
                                "approved"
                              )
                            }
                            disabled={savingMilestoneId === m.id}
                            className="text-[11px] px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateMilestoneStatus(
                                m.id,
                                "rejected"
                              )
                            }
                            disabled={savingMilestoneId === m.id}
                            className="text-[11px] px-2 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200"
                          >
                            Reject
                          </button>
                        </div>
                      </div>

                      {m.description && (
                        <p className="text-xs text-slate-500">
                          {m.description}
                        </p>
                      )}

                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-500">
                          Supervisor feedback
                        </label>
                        <textarea
                          value={
                            feedbackDrafts[m.id] ??
                            m.supervisor_feedback ??
                            ""
                          }
                          onChange={(e) =>
                            setFeedbackDrafts((prev) => ({
                              ...prev,
                              [m.id]: e.target.value,
                            }))
                          }
                          rows={2}
                          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
                          placeholder="Summarise the decision and next steps."
                        />
                      </div>

                      {mSubmissions.length > 0 && (
                        <div className="mt-2 border-t border-slate-100 pt-2 space-y-1">
                          <p className="text-[11px] font-medium text-slate-700">
                            Submission versions
                          </p>
                          <div className="space-y-1">
                            {mSubmissions.map((s, idx) => (
                              <div
                                key={s.id}
                                className="flex items-center justify-between text-[11px] text-slate-600"
                              >
                                <div className="flex items-center gap-2">
                                  <span>
                                    v{s.version_number} • {s.file_name}
                                  </span>
                                  {idx === 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                      Latest
                                    </span>
                                  )}
                                </div>
                                <a
                                  href={s.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:underline"
                                >
                                  Download
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-6">
          <div className="bg-white border rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-4 h-4 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">
                Supervision Thread
              </h2>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Use this space for structured supervision notes and
                  clarifications. This is not a casual chat channel.
                </p>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className={`rounded-xl px-3 py-2 text-xs border ${
                      c.author_role === "supervisor"
                        ? "bg-slate-50 border-slate-200"
                        : "bg-indigo-50 border-indigo-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-800">
                        {c.author_role === "supervisor"
                          ? "Supervisor"
                          : "Student"}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(
                          c.created_at
                        ).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {c.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 space-y-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                placeholder="Add a structured supervision note or clarification."
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddComment}
                  disabled={submittingComment || !commentText.trim()}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs disabled:opacity-60"
                >
                  {submittingComment && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase();

  if (normalized === "completed") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
        <CheckCircle2 className="w-3 h-3" />
        Completed
      </span>
    );
  }

  if (
    normalized === "proposal" ||
    normalized === "research" ||
    normalized === "writing" ||
    normalized === "review"
  ) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs">
        <Clock className="w-3 h-3" />
        {status}
      </span>
    );
  }

  if (normalized === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs">
        <AlertCircle className="w-3 h-3" />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-xs">
      <AlertCircle className="w-3 h-3" />
      {status || "Unknown"}
    </span>
  );
}

