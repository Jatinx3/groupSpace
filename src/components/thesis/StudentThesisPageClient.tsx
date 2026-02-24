"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  FileText,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Thesis {
  id: string;
  title: string;
  description: string;
  status: string;
  start_date: string | null;
  deadline: string | null;
  supervisor_id: string;
  supervisor?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

interface Milestone {
  id: string;
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

interface Props {
  studentName: string;
  thesis: Thesis | null;
  milestones: Milestone[];
  submissions: Submission[];
  comments: Comment[];
}

export default function StudentThesisPageClient({
  studentName,
  thesis,
  milestones,
  submissions,
  comments,
}: Props) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const completedMilestones = milestones.filter(
    (m) => m.status === "approved"
  ).length;

  const progress =
    milestones.length > 0
      ? Math.round((completedMilestones / milestones.length) * 100)
      : 0;

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

  const handleUpload = async (milestoneId: string, file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("milestoneId", milestoneId);
      formData.append("file", file);

      const res = await fetch("/student/thesis/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.error("Upload failed");
      } else {
        router.refresh();
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !thesis) return;
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
  };

  if (!thesis) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Thesis Collab
            </h1>
            <p className="text-slate-500 text-sm">
              No thesis project is set up for your account yet.
            </p>
          </div>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <p className="text-sm text-slate-500">
            Once your supervisor creates a thesis project for you, it
            will appear here with milestones, submissions, and feedback.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <section className="bg-white border rounded-2xl shadow-sm p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <GraduationCap className="w-4 h-4" />
            <span>Thesis Collab</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            {thesis.title || "Untitled Thesis"}
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            {thesis.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {thesis.supervisor && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Supervisor:{" "}
                {thesis.supervisor.first_name}{" "}
                {thesis.supervisor.last_name}
              </span>
            )}
            <StatusBadge status={thesis.status} />
            {thesis.deadline && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3 h-3" />
                Final Deadline:{" "}
                {new Date(thesis.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-2 rounded-full bg-indigo-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {completedMilestones} of {milestones.length} milestones
            approved
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Milestones + Submissions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Milestones Timeline */}
          <div className="bg-white border rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Milestones Timeline
              </h2>
            </div>

            {milestones.length === 0 ? (
              <p className="text-sm text-slate-500">
                Your supervisor hasn’t added any milestones yet.
              </p>
            ) : (
              <ol className="space-y-4">
                {milestones.map((m, index) => {
                  const mSubmissions =
                    submissionsByMilestone[m.id] ?? [];
                  const latest = mSubmissions[0];

                  return (
                    <li
                      key={m.id}
                      className="relative pl-8 pb-4 border-l border-slate-200 last:border-transparent"
                    >
                      <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-white border-2 border-indigo-500" />

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {index + 1}. {m.title}
                          </p>
                          {m.due_date && (
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                Due{" "}
                                {new Date(
                                  m.due_date
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <StatusBadge status={m.status} />

                          <label className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                            <FileText className="w-3 h-3" />
                            <span>
                              {latest
                                ? "Upload new version"
                                : "Upload submission"}
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const file =
                                  e.target.files?.[0];
                                if (file) {
                                  handleUpload(m.id, file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {m.description && (
                        <p className="text-xs text-slate-500 mt-1">
                          {m.description}
                        </p>
                      )}

                      {m.supervisor_feedback && (
                        <div className="mt-3 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 flex gap-2">
                          <AlertCircle className="w-4 h-4 mt-0.5" />
                          <div>
                            <p className="font-medium">
                              Supervisor feedback
                            </p>
                            <p className="mt-1">
                              {m.supervisor_feedback}
                            </p>
                          </div>
                        </div>
                      )}

                      {latest && (
                        <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3 h-3" />
                            <span className="font-medium">
                              Latest submission:
                            </span>
                            <span>{latest.file_name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px]">
                              v{latest.version_number}
                            </span>
                          </div>
                          <a
                            href={latest.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline"
                          >
                            Download
                          </a>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {/* Submission History */}
          <div className="bg-white border rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">
                Submission History
              </h2>
            </div>

            {submissions.length === 0 ? (
              <p className="text-sm text-slate-500">
                No submissions yet.
              </p>
            ) : (
              <div className="space-y-3">
                {submissions
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                  )
                  .map((s, idx) => {
                    const isLatest =
                      submissionsByMilestone[
                        s.milestone_id
                      ]?.[0]?.id === s.id;

                    const milestone = milestones.find(
                      (m) => m.id === s.milestone_id
                    );

                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">
                              {milestone
                                ? milestone.title
                                : "Milestone"}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px]">
                              v{s.version_number}
                            </span>
                            {isLatest && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px]">
                                Latest Version
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <span>{s.file_name}</span>
                            <span>•</span>
                            <span>
                              {new Date(
                                s.created_at
                              ).toLocaleString()}
                            </span>
                          </div>
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
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Comments + AI Placeholder */}
        <div className="space-y-6">
          {/* Supervisor Comments */}
          <div className="bg-white border rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-4 h-4 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">
                Supervisor Comments
              </h2>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-sm text-slate-500">
                  This is a structured space for academic supervision
                  comments and clarifications.
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
                          : "You"}
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
                placeholder="Ask a structured question or respond to feedback (not a casual chat)."
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
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* AI Placeholder */}
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  AI Thesis Assistant – Coming Soon
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Planned AI tools to support academic writing and
                  supervision. Disabled for now.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px]">
                Disabled
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "AI Writing Quality Feedback",
                "AI Research Gap Detection",
                "AI Citation Suggestions",
                "AI Timeline Risk Prediction",
              ].map((label) => (
                <button
                  key={label}
                  disabled
                  className="w-full text-left text-xs px-3 py-3 rounded-xl border border-slate-200 bg-white text-slate-500 flex items-start gap-2 opacity-60 cursor-not-allowed"
                >
                  <CheckCircle2 className="w-3 h-3 mt-0.5 text-slate-400" />
                  <span>{label}</span>
                </button>
              ))}
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

  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-xs">
      <AlertCircle className="w-3 h-3" />
      {status || "Unknown"}
    </span>
  );
}

