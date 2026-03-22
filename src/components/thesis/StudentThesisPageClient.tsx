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
  Send
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
  author?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
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

const AVATAR_COLORS = [
  "bg-violet-500","bg-blue-500","bg-emerald-500","bg-orange-500",
  "bg-rose-500","bg-cyan-500","bg-amber-500","bg-fuchsia-500",
];

function getAvatarColor(userId: string) {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = userId.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function getInitials(name?: string) {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
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
      if (textareaRef.current) textareaRef.current.style.height = "auto";
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(); }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const groupedComments: { date: string; messages: Comment[] }[] = [];
  comments.forEach((msg) => {
    const label = formatDateLabel(msg.created_at);
    const last = groupedComments[groupedComments.length - 1];
    if (!last || last.date !== label) groupedComments.push({ date: label, messages: [msg] });
    else last.messages.push(msg);
  });

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
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">No milestones yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Your supervisor hasn't assigned any milestones.</p>
                </div>
              ) : (
                <div className="relative pl-4 space-y-8">
                  {/* Vertical Line */}
                  <div className="absolute left-[31px] top-4 bottom-4 w-px bg-gray-200" />

                  {milestones.map((m, index) => {
                    const mSubmissions = submissionsByMilestone[m.id] ?? [];
                    const latest = mSubmissions[0];
                    const isApproved = m.status === "approved";
                    const isRejected = m.status === "rejected";

                    return (
                      <div key={m.id} className="relative flex gap-6 group">
                        {/* Timeline Node */}
                        <div className="shrink-0 mt-1 z-10">
                          <div
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[11px] font-bold bg-white transition-all duration-300 group-hover:scale-110 shadow-sm ${
                              isApproved
                                ? "border-emerald-500 text-emerald-600 ring-4 ring-emerald-50"
                                : isRejected
                                ? "border-red-400 text-red-500 ring-4 ring-red-50"
                                : "border-gray-900 text-gray-900 ring-4 ring-gray-50"
                            }`}
                          >
                            {isApproved ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : index + 1}
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="flex-1 min-w-0 bg-white border border-gray-100/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 flex-wrap mb-1.5">
                                <h3 className="text-base font-bold text-gray-900">{m.title}</h3>
                                <StatusBadge status={m.status} />
                              </div>
                              
                              {m.due_date && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 text-[11px] font-semibold text-gray-500 mb-3">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>Due {new Date(m.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                                </div>
                              )}
                              
                              {m.description && (
                                <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">{m.description}</p>
                              )}
                            </div>

                            {/* Actions / Upload */}
                            <div className="shrink-0">
                              <label className="group/btn relative cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-300 shadow-sm hover:shadow-md active:scale-95">
                                <Upload className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5" />
                                {latest ? "Update Version" : "Upload Delivery"}
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
                            <div className="mt-5 flex gap-3 bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 mb-1.5">
                                  Supervisor Feedback
                                </h4>
                                <p className="text-sm text-amber-900 leading-relaxed">{m.supervisor_feedback}</p>
                              </div>
                            </div>
                          )}

                          {latest && (
                            <div className="mt-4 flex items-center justify-between bg-gray-50/80 border border-gray-100 rounded-xl px-4 py-3 group/sub transition-colors hover:bg-gray-50 hover:border-gray-200">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-900 truncate">
                                      {latest.file_name}
                                    </span>
                                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-gray-900 text-white text-[10px] font-bold">
                                      v{latest.version_number}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                                    Delivered {new Date(latest.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <a
                                href={latest.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-200 transition-all opacity-0 group-hover/sub:opacity-100"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── Submissions ── */}
          {activeTab === "submissions" && (
            <>
              {submissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">No submissions found.</p>
                  <p className="text-xs text-gray-400 mt-1">Upload files on your milestones to see them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {submissions
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )
                    .map((s) => {
                      const isLatest = submissionsByMilestone[s.milestone_id]?.[0]?.id === s.id;
                      const milestone = milestones.find((m) => m.id === s.milestone_id);

                      return (
                        <div
                          key={s.id}
                          className="group relative flex flex-col bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-300 hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-gray-900 group-hover:text-white transition-colors duration-300">
                              <FileText className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
                            </div>
                            {isLatest && (
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                Latest
                              </span>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1" title={s.file_name}>
                              {s.file_name}
                            </h4>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-bold">
                                v{s.version_number}
                              </span>
                              <p className="text-xs text-gray-500 line-clamp-1">{milestone?.title ?? "Unknown Milestone"}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                            <p className="text-[10px] font-medium text-gray-400">
                              {new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                            <a
                              href={s.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-100 hover:text-gray-900 transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </>
          )}

          {/* ── Discussion ── */}
          {activeTab === "discussion" && (
            <div className="flex flex-col h-[550px] max-w-3xl">
              
              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto pr-2 flex flex-col-reverse">
                <div className="flex flex-col justify-end pb-4">
                  {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-xl">
                        💬
                      </div>
                      <p className="text-gray-500 text-sm font-medium">No messages yet</p>
                      <p className="text-gray-400 text-xs">Be the first to say something!</p>
                    </div>
                  ) : (
                    groupedComments.map(({ date, messages: dayMsgs }) => (
                      <div key={date}>
                        <div className="flex items-center gap-3 my-5">
                          <div className="flex-1 h-px bg-gray-100" />
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest shrink-0">
                            {date}
                          </span>
                          <div className="flex-1 h-px bg-gray-100" />
                        </div>

                        <div className="space-y-0.5">
                          {dayMsgs.map((msg, idx) => {
                            const isOwn = msg.author_role === "student";
                            const authorName =
                              msg.author?.first_name 
                                ? `${msg.author.first_name} ${msg.author.last_name}`
                                : msg.author_role === "student" ? studentName : "Supervisor";
                            const prevMsg = dayMsgs[idx - 1];
                            const isSameSender = prevMsg?.author_id === msg.author_id;
                            const showMeta = !isSameSender;
                            
                            const textLines = msg.content.split("\n").filter(l => l.trim());

                            return (
                              <div
                                key={msg.id}
                                className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : "flex-row"} ${showMeta ? "mt-5" : "mt-0.5"}`}
                              >
                                <div className="shrink-0 w-8">
                                  {showMeta && (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${isOwn ? "bg-gray-900" : getAvatarColor(msg.author_id)}`}>
                                      {isOwn ? getInitials(studentName) : getInitials(authorName)}
                                    </div>
                                  )}
                                </div>

                                <div className={`flex flex-col max-w-[80%] ${isOwn ? "items-end" : "items-start"}`}>
                                  {showMeta && (
                                    <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                                      <span className="text-xs font-semibold text-gray-800">{isOwn ? "You" : authorName}</span>
                                      <span className="text-[10px] text-gray-400">{formatTime(msg.created_at)}</span>
                                    </div>
                                  )}

                                  {textLines.length > 0 && (
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                                      isOwn
                                        ? "bg-gray-900 text-white rounded-tr-sm"
                                        : "bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm"
                                    }`}>
                                      {textLines.map((line, i) => <p key={i}>{line}</p>)}
                                    </div>
                                  )}

                                  {!showMeta && (
                                    <span className="text-[10px] text-gray-400 mt-0.5 px-1">{formatTime(msg.created_at)}</span>
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

              {/* Input Area */}
              <div className="shrink-0 pt-4 mt-2 border-t border-gray-100">
                <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 focus-within:border-gray-400 focus-within:bg-white transition-colors">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={commentText}
                    onChange={autoResize}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question or respond to feedback..."
                    className="flex-1 bg-transparent text-sm resize-none focus:outline-none text-gray-800 placeholder-gray-400 leading-relaxed overflow-y-auto self-center pl-2 my-0.5"
                    style={{ maxHeight: 120 }}
                  />

                  <div className="flex-none pb-0.5">
                    <button
                      onClick={handleAddComment}
                      disabled={submittingComment || !commentText.trim()}
                      className="w-8 h-8 flex flex-col items-center justify-center bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white rounded-xl transition-colors"
                    >
                      {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send size={14} className="ml-0.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2 px-1">
                   <p className="text-[10px] text-gray-400 select-none">
                     Enter to send · Shift+Enter for new line
                   </p>
                </div>
              </div>

            </div>
          )}

          {/* ── Drafts ── */}
          {activeTab === "drafts" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Thesis Drafts</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload full thesis draft versions for your supervisor to review.
                  </p>
                </div>
                <button
                  onClick={() => setShowDraftModal(true)}
                  className="shrink-0 inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  Upload Draft
                </button>
              </div>

              {drafts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-6 h-6 text-gray-400" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-700">No drafts uploaded yet</h4>
                  <p className="text-xs text-gray-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                    Upload your first thesis document here. Each upload is versioned automatically, so your supervisor can track your progress.
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
                        className="group relative flex flex-col bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-300 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center text-sm font-bold shadow-sm transition-transform group-hover:scale-105">
                            v{d.version_number}
                          </div>
                          {idx === 0 && (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-[10px] font-bold uppercase tracking-wider">
                              Latest
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 mb-1.5 line-clamp-1" title={d.file_name}>
                            {d.file_name}
                          </h4>
                          <p className="text-[11px] font-medium text-gray-400">
                            Uploaded {new Date(d.uploaded_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                          
                          {d.student_note && (
                            <div className="mt-4 flex items-start gap-2 bg-amber-50/50 border border-amber-100/50 rounded-lg p-3">
                              <StickyNote className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-amber-900 italic leading-relaxed line-clamp-3">
                                {d.student_note}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="pt-4 mt-4 border-t border-gray-50 flex justify-end">
                          <a
                            href={d.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-900 hover:text-white transition-colors"
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

          {/* ── AI Tools ── */}
          {activeTab === "ai" && (
            <div className="max-w-lg">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-base font-bold text-gray-900">AI Thesis Assistant</h3>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-sm">
                    Intelligent contextual tools are coming soon to support your academic writing and supervision.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider shrink-0 border border-gray-200">
                  Coming Soon
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Writing quality feedback", icon: FileText },
                  { label: "Research gap detection", icon: AlertCircle },
                  { label: "Citation suggestions", icon: CheckCircle2 },
                  { label: "Timeline risk prediction", icon: Calendar },
                ].map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 px-5 py-4 rounded-xl bg-white border border-gray-100 opacity-60 hover:opacity-100 hover:shadow-sm hover:border-gray-200 transition-all cursor-not-allowed"
                    title="Coming soon"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="text-xs text-gray-700 font-bold">{label}</span>
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
