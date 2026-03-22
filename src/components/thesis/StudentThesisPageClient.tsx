"use client";

import { useMemo, useRef, useState } from "react";
import {
  Calendar,
  Clock,
  FileText,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  GraduationCap,
  Upload,
  Download,
  Sparkles,
  BookOpen,
  X,
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

interface Props {
  studentName: string;
  thesis: Thesis | null;
  milestones: Milestone[];
  submissions: Submission[];
  comments: Comment[];
  drafts: Draft[];
}

export default function StudentThesisPageClient({
  studentName,
  thesis,
  milestones,
  submissions,
  comments,
  drafts,
}: Props) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [activeTab, setActiveTab] = useState<"milestones" | "submissions" | "discussion" | "drafts" | "ai">("milestones");

  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [uploadingDraft, setUploadingDraft] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const draftFileRef = useRef<HTMLInputElement>(null);

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
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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
      if (res.ok) router.refresh();
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
        body: JSON.stringify({ thesisId: thesis.id, content: commentText.trim() }),
      });
      if (res.ok) {
        setCommentText("");
        router.refresh();
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDraftUpload = async () => {
    if (!draftFile || !thesis) return;
    setDraftError(null);
    setUploadingDraft(true);
    try {
      const formData = new FormData();
      formData.append("thesisId", thesis.id);
      formData.append("file", draftFile);
      formData.append("studentNote", draftNote.trim());
      const res = await fetch("/student/thesis/draft", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json();
        setDraftError(body.error ?? "Upload failed");
        return;
      }
      setShowDraftModal(false);
      setDraftFile(null);
      setDraftNote("");
      router.refresh();
    } finally {
      setUploadingDraft(false);
    }
  };

  const closeDraftModal = () => {
    if (uploadingDraft) return;
    setShowDraftModal(false);
    setDraftFile(null);
    setDraftNote("");
    setDraftError(null);
  };

  if (!thesis) {
    return (
      <div className="space-y-6">
        <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-8 py-7">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Thesis Collab
              </p>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              No thesis assigned yet
            </h1>
            <p className="mt-2 text-sm text-gray-400 font-medium max-w-lg">
              Once your supervisor creates a thesis project for you, milestones,
              submissions and feedback will appear here.
            </p>
          </div>
          <div className="h-1 bg-gradient-to-r from-gray-900 via-gray-600 to-gray-200" />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-8 py-7 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Thesis Collab
              </p>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 leading-tight">
              {thesis.title || "Untitled Thesis"}
            </h1>
            {thesis.description && (
              <p className="text-sm text-gray-400 font-medium max-w-2xl leading-relaxed">
                {thesis.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {thesis.supervisor && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                  {thesis.supervisor.first_name} {thesis.supervisor.last_name}
                </span>
              )}
              <StatusBadge status={thesis.status} />
              {thesis.deadline && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold uppercase tracking-wide">
                  <Clock className="w-3 h-3" />
                  Deadline:{" "}
                  {new Date(thesis.deadline).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="w-full md:w-56 shrink-0">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Progress
                </p>
                <p className="text-xl font-extrabold tabular-nums text-gray-900">
                  {progress}%
                </p>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-900 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400 font-medium">
                {completedMilestones} of {milestones.length} milestones approved
              </p>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-gray-900 via-gray-600 to-gray-200" />
      </section>

      {/* ── Tabs ── */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center gap-1 px-6 pt-4 border-b border-gray-100">
          {(
            [
              { key: "milestones", label: "Milestones", icon: Calendar, count: milestones.length },
              { key: "submissions", label: "Submissions", icon: FileText, count: submissions.length },
              { key: "drafts", label: "Drafts", icon: BookOpen, count: drafts.length },
              { key: "discussion", label: "Discussion", icon: MessageCircle, count: comments.length },
              { key: "ai", label: "AI Tools", icon: Sparkles, count: null },
            ] as const
          ).map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors rounded-t-xl ${
                activeTab === key
                  ? "text-gray-900 bg-gray-50 border border-b-0 border-gray-100"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {count !== null && count > 0 && (
                <span
                  className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full ${
                    activeTab === key
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">

          {/* ── Milestones ── */}
          {activeTab === "milestones" && (
            <>
              {milestones.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">
                  No milestones added yet.
                </p>
              ) : (
                <ol className="space-y-0">
                  {milestones.map((m, index) => {
                    const mSubmissions = submissionsByMilestone[m.id] ?? [];
                    const latest = mSubmissions[0];
                    const isApproved = m.status === "approved";
                    const isRejected = m.status === "rejected";

                    return (
                      <li key={m.id} className="relative flex gap-5 pb-7 last:pb-0">
                        {index < milestones.length - 1 && (
                          <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-100" />
                        )}
                        <div className="shrink-0 mt-1">
                          <div
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[11px] font-bold transition-colors ${
                              isApproved
                                ? "bg-gray-900 border-gray-900 text-white"
                                : isRejected
                                ? "bg-white border-gray-300 text-gray-400"
                                : "bg-white border-gray-300 text-gray-500"
                            }`}
                          >
                            {isApproved ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                              {m.due_date && (
                                <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Due{" "}
                                  {new Date(m.due_date).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </p>
                              )}
                              {m.description && (
                                <p className="text-xs text-gray-400 mt-1">{m.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <StatusBadge status={m.status} />
                              <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-200 transition-colors">
                                <Upload className="w-3 h-3" />
                                {latest ? "New version" : "Upload"}
                                <input
                                  type="file"
                                  className="hidden"
                                  disabled={uploading}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUpload(m.id, file);
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                          {m.supervisor_feedback && (
                            <div className="mt-3 flex gap-2.5 bg-gray-50 border border-gray-200 rounded-xl p-3">
                              <AlertCircle className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                                  Supervisor Feedback
                                </p>
                                <p className="text-xs text-gray-700">{m.supervisor_feedback}</p>
                              </div>
                            </div>
                          )}
                          {latest && (
                            <div className="mt-3 flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span className="text-xs text-gray-600 truncate">{latest.file_name}</span>
                                <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-gray-900 text-white text-[10px] font-bold">
                                  v{latest.version_number}
                                </span>
                              </div>
                              <a
                                href={latest.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-900 transition-colors ml-3"
                              >
                                <Download className="w-3 h-3" />
                                Download
                              </a>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </>
          )}

          {/* ── Submissions ── */}
          {activeTab === "submissions" && (
            <>
              {submissions.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">No submissions yet.</p>
              ) : (
                <div className="space-y-2">
                  {submissions
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )
                    .map((s) => {
                      const isLatest =
                        submissionsByMilestone[s.milestone_id]?.[0]?.id === s.id;
                      const milestone = milestones.find((m) => m.id === s.milestone_id);

                      return (
                        <div
                          key={s.id}
                          className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 hover:border-gray-200 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold text-gray-800">
                                  {milestone?.title ?? "Milestone"}
                                </span>
                                <span className="px-1.5 py-0.5 rounded-full bg-gray-900 text-white text-[10px] font-bold">
                                  v{s.version_number}
                                </span>
                                {isLatest && (
                                  <span className="px-2 py-0.5 rounded-full border border-gray-300 text-gray-500 text-[10px] font-semibold uppercase tracking-wide">
                                    Latest
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                                {s.file_name}&nbsp;·&nbsp;
                                {new Date(s.created_at).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          <a
                            href={s.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-900 transition-colors ml-4"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </a>
                        </div>
                      );
                    })}
                </div>
              )}
            </>
          )}

          {/* ── Discussion ── */}
          {activeTab === "discussion" && (
            <div className="flex flex-col gap-4 max-w-2xl">
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center">No messages yet.</p>
                ) : (
                  comments.map((c) => {
                    const isSupervisor = c.author_role === "supervisor";
                    return (
                      <div
                        key={c.id}
                        className={`rounded-xl px-3 py-2.5 text-xs ${
                          isSupervisor
                            ? "bg-gray-100 text-gray-700"
                            : "bg-gray-900 text-white ml-16"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span
                            className={`font-bold text-[10px] uppercase tracking-wide ${
                              isSupervisor ? "text-gray-500" : "text-gray-300"
                            }`}
                          >
                            {isSupervisor ? "Supervisor" : "You"}
                          </span>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {new Date(c.created_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                        <p className="leading-snug whitespace-pre-wrap">{c.content}</p>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="space-y-2 border-t border-gray-100 pt-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  placeholder="Ask a question or respond to feedback…"
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddComment}
                    disabled={submittingComment || !commentText.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-[11px] font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-gray-700 transition-colors"
                  >
                    {submittingComment && <Loader2 className="w-3 h-3 animate-spin" />}
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Drafts ── */}
          {activeTab === "drafts" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Thesis Drafts</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Upload full thesis draft versions for your supervisor to review.
                  </p>
                </div>
                <button
                  onClick={() => setShowDraftModal(true)}
                  className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Draft
                </button>
              </div>

              {drafts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">No drafts uploaded yet.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Upload your first thesis draft to share with your supervisor.
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
                                  <span className="px-2 py-0.5 rounded-full border border-gray-300 text-gray-500 text-[10px] font-semibold uppercase tracking-wide">
                                    Latest
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                {d.file_name}&nbsp;·&nbsp;Uploaded{" "}
                                {new Date(d.uploaded_at).toLocaleDateString("en-GB", {
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

          {/* ── AI Tools ── */}
          {activeTab === "ai" && (
            <div className="max-w-lg">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                    Coming Soon
                  </p>
                  <h2 className="font-semibold text-gray-900">AI Thesis Assistant</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Planned tools to support academic writing and supervision.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 text-[10px] font-semibold uppercase tracking-wide shrink-0">
                  Disabled
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Writing quality feedback", icon: FileText },
                  { label: "Research gap detection", icon: AlertCircle },
                  { label: "Citation suggestions", icon: CheckCircle2 },
                  { label: "Timeline risk prediction", icon: Calendar },
                ].map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-100 opacity-50"
                  >
                    <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-600 font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Draft Upload Modal ── */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDraftModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Upload Thesis Draft</h2>
                <p className="text-xs text-gray-500 mt-0.5">PDF or DOCX · Each upload becomes a new version</p>
              </div>
              <button
                onClick={closeDraftModal}
                disabled={uploadingDraft}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  File <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() => draftFileRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-7 cursor-pointer transition-colors ${
                    draftFile
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {draftFile ? (
                    <>
                      <FileText className="w-6 h-6 text-gray-700" />
                      <span className="text-sm font-medium text-gray-800 text-center break-all">
                        {draftFile.name}
                      </span>
                      <span className="text-xs text-gray-400">Click to change file</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-sm text-gray-500">Click to select PDF or DOCX</span>
                    </>
                  )}
                </div>
                <input
                  ref={draftFileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setDraftFile(f); setDraftError(null); }
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Note{" "}
                  <span className="text-gray-400 font-normal normal-case tracking-normal">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                  rows={3}
                  placeholder="e.g. Added methodology section, revised introduction…"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50 transition"
                />
              </div>

              {draftError && (
                <p className="text-xs text-red-500 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {draftError}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeDraftModal}
                  disabled={uploadingDraft}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDraftUpload}
                  disabled={uploadingDraft || !draftFile}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-50 hover:bg-gray-800 transition"
                >
                  {uploadingDraft && <Loader2 className="w-4 h-4 animate-spin" />}
                  {uploadingDraft ? "Uploading…" : "Upload Draft"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase();

  if (normalized === "approved" || normalized === "completed") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wide">
        <CheckCircle2 className="w-3 h-3" />
        {normalized === "approved" ? "Approved" : "Completed"}
      </span>
    );
  }

  if (normalized === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200 text-[10px] font-bold uppercase tracking-wide">
        <AlertCircle className="w-3 h-3" />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wide">
      <Clock className="w-3 h-3" />
      {status || "Pending"}
    </span>
  );
}
