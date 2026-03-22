"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  FileText,
  CalendarClock,
  File,
  Folder,
  Crown,
  Copy,
  Check,
  Mail,
  UserPlus,
  X,
  Download,
  ChevronRight,
  ChevronDown,
  Send,
  Clock,
  Video,
  Plus,
  Trash2,
} from "lucide-react";
import { profAddMemberByEmail } from "../../app/professor/actions";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface ProjectFile {
  id: string;
  fileName: string;
  fileSize: number | null;
  createdAt: string;
  uploaderName: string;
}

interface FolderItem {
  id: string;
  name: string;
  parent_id: string | null;
}

interface ScheduledMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  link: string;
}

interface Props {
  courseId: string;
  courseName: string;
  teamId: string;
  teamName: string;
  inviteCode: string;
  members: Member[];
  initialMessages: { id: string; content: string; createdAt: string; userId: string; senderName: string }[];
  files: ProjectFile[];
  folders: FolderItem[];
  currentUserId: string;
  currentUserName: string;
}

type Tab = "info" | "docs" | "schedule";

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d === 1) return "Yesterday";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function LocalAvatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 shrink-0"
    >
      {initials || "?"}
    </div>
  );
}

function InviteModal({
  teamName,
  teamId,
  inviteCode,
  memberCount,
  onClose,
}: {
  teamName: string;
  teamId: string;
  inviteCode: string;
  memberCount: number;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [emailStatus, setEmailStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const codeChunks = inviteCode.match(/.{1,4}/g) ?? [inviteCode];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailInvite = () => {
    if (!email.trim()) return;
    setEmailStatus("idle");
    setErrorMsg("");
    startTransition(async () => {
      try {
        await profAddMemberByEmail(teamId, email.trim());
        setEmail("");
        setEmailStatus("success");
        router.refresh();
        setTimeout(() => setEmailStatus("idle"), 3000);
      } catch (e: any) {
        setErrorMsg(e.message ?? "Something went wrong");
        setEmailStatus("error");
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:flex-row">

        {/* LEFT — dark code panel */}
        <div className="bg-gray-900 sm:w-[52%] px-8 py-8 flex flex-col justify-between relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition sm:hidden"
          >
            <X className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                <UserPlus className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Invite Code</p>
                <p className="text-xs font-semibold text-white leading-none">{teamName}</p>
              </div>
            </div>

            <div className="mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-3">Share this code</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
                {codeChunks.map((chunk, i) => (
                  <span key={i} className="font-mono text-2xl font-black tracking-widest text-white select-all">
                    {chunk}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-8 gap-1.5">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full bg-white/10"
                />
              ))}
            </div>
          </div>

          <div>
            <button
              onClick={handleCopy}
              className={`mt-8 w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                copied
                  ? "bg-white text-gray-900"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
              }`}
            >
              {copied ? (
                <><Check className="w-4 h-4" /> Copied!</>
              ) : (
                <><Copy className="w-4 h-4" /> Copy Code</>
              )}
            </button>
            <div className="mt-3 flex items-center gap-1.5">
              <Users className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">
                {memberCount} member{memberCount !== 1 ? "s" : ""} already in
              </span>
            </div>
          </div>
        </div>

        {/* Perforated divider — desktop only */}
        <div className="hidden sm:flex flex-col items-center justify-center relative w-0">
          <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-white shadow-inner" />
          <div className="h-full border-l-2 border-dashed border-gray-200" />
          <div className="absolute -left-3 bottom-0 w-6 h-6 rounded-full bg-white shadow-inner" />
        </div>

        {/* RIGHT — email invite panel */}
        <div className="flex-1 px-8 py-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Or invite directly</p>
                <h2 className="text-base font-bold text-gray-900 mt-0.5">Add by email</h2>
              </div>
              <button
                onClick={onClose}
                className="hidden sm:flex w-8 h-8 items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-gray-400 mt-3 mb-6 leading-relaxed">
              Enter a student's email address and they'll be added to the team instantly.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 focus-within:border-gray-900 focus-within:bg-white transition">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailInvite()}
                  placeholder="student@university.edu"
                  className="flex-1 py-3 text-sm bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
                />
              </div>

              <button
                onClick={handleEmailInvite}
                disabled={isPending || !email.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition"
              >
                <Send className="w-3.5 h-3.5" />
                {isPending ? "Sending..." : "Send Invite"}
              </button>

              {emailStatus === "success" && (
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                  <Check className="w-4 h-4 text-gray-700 shrink-0" />
                  <p className="text-sm font-medium text-gray-700">Student added successfully!</p>
                </div>
              )}
              {emailStatus === "error" && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                  <p className="text-sm text-red-600">{errorMsg}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex items-start gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
            <p className="text-xs text-gray-500 leading-relaxed">
              Only share the invite code with enrolled students. Anyone with the code can request to join.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfessorTeamWorkspaceClient({
  courseId,
  courseName,
  teamId,
  teamName,
  inviteCode,
  members,
  files,
  folders,
  currentUserId: _currentUserId,
  currentUserName: _currentUserName,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const tabs = [
    { key: "info" as Tab, label: "Team Info", icon: Users },
    { key: "docs" as Tab, label: "Structure", icon: FileText, count: files.length },
    { key: "schedule" as Tab, label: "Schedule Call", icon: CalendarClock },
  ];

  return (
    <div className="space-y-6">
      {showInviteModal && (
        <InviteModal
          teamName={teamName}
          teamId={teamId}
          inviteCode={inviteCode}
          memberCount={members.length}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      <div className="flex items-center gap-2">
        <Link
          href={`/professor/courses/${courseId}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {courseName}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-700 font-medium">{teamName}</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Team Workspace</p>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight mt-0.5">{teamName}</h1>
              <p className="text-sm text-gray-400 mt-0.5">{courseName} · {members.length} member{members.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Invite Members
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition border-b-2 -mb-px shrink-0 ${
                activeTab === key
                  ? "border-gray-900 text-gray-900 bg-gray-50"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count !== undefined && count > 0 && (
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "info" && (
          <div className="p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Members · {members.length}
            </p>
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                  <LocalAvatar name={`${member.firstName} ${member.lastName}`} size={38} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{member.firstName} {member.lastName}</p>
                      {member.role === "LEADER" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-900 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-full">
                          <Crown className="w-2.5 h-2.5" />
                          Leader
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{member.email}</p>
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full shrink-0">
                    {member.role === "LEADER" ? "Leader" : "Member"}
                  </span>
                </div>
              ))}
              {members.length === 0 && (
                <div className="text-center py-10">
                  <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No members yet.</p>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="mt-3 text-sm text-gray-900 font-medium underline underline-offset-2"
                  >
                    Invite the first member
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "docs" && (
          <ReadOnlyStructureTab teamId={teamId} files={files} folders={folders} />
        )}

        {activeTab === "schedule" && (
          <ScheduleTab teamName={teamName} members={members} />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   READ-ONLY STRUCTURE TAB
───────────────────────────────────────── */
function ReadOnlyStructureTab({
  teamId,
  files,
  folders,
}: {
  teamId: string;
  files: ProjectFile[];
  folders: FolderItem[];
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const tree = useMemo(() => {
    const folderMap: Record<string, any> = {};
    folders.forEach((f) => { folderMap[f.id] = { ...f, type: "folder", children: [] }; });
    folders.forEach((f) => {
      if (f.parent_id) folderMap[f.parent_id]?.children.push(folderMap[f.id]);
    });
    files.forEach((file: any) => {
      if (!file.folder_id) return;
      const parent = folderMap[file.folder_id];
      if (parent) parent.children.push({ ...file, type: "file" });
    });
    return folders.filter((f) => !f.parent_id).map((f) => folderMap[f.id]);
  }, [folders, files]);

  const rootFiles = files.filter((f: any) => !f.folder_id);

  const fileTypes = useMemo(() => {
    const map: Record<string, number> = {};
    files.forEach((f) => {
      const ext = f.fileName.split(".").pop()?.toLowerCase() || "other";
      map[ext] = (map[ext] || 0) + 1;
    });
    return map;
  }, [files]);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Files", value: files.length },
          { label: "Folders", value: folders.length },
          { label: "File Types", value: Object.keys(fileTypes).length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-extrabold text-gray-900 tabular-nums">{value}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* File Explorer */}
        <div className="lg:col-span-2 border border-gray-100 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800">File Explorer</h2>
            <a
              href={`/api/teams/${teamId}/download`}
              className="flex items-center gap-1.5 text-xs font-semibold border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download Project
            </a>
          </div>

          <div className="p-4 space-y-0.5 max-h-[480px] overflow-auto">
            {tree.length === 0 && rootFiles.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No files or folders yet</p>
              </div>
            ) : (
              <>
                {tree.map((node) => (
                  <ReadOnlyTreeNode key={node.id} node={node} expanded={expanded} toggle={toggle} level={0} />
                ))}
                {rootFiles.map((file) => (
                  <ReadOnlyFileRow key={file.id} file={file} level={0} />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div className="border border-gray-100 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">File Types</h3>
            {Object.keys(fileTypes).length === 0 ? (
              <p className="text-xs text-gray-400">No files yet</p>
            ) : (
              <div className="space-y-2.5">
                {Object.entries(fileTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                      <span className="text-xs font-semibold text-gray-700 uppercase">{type}</span>
                    </div>
                    <span className="text-xs text-gray-400">{count} file{count !== 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-gray-100 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Recent Files</h3>
            {files.length === 0 ? (
              <p className="text-xs text-gray-400">No files yet</p>
            ) : (
              <div className="space-y-2.5">
                {files.slice(0, 6).map((file) => (
                  <div key={file.id} className="flex items-center gap-2">
                    <File className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <p className="text-xs text-gray-600 truncate flex-1">{file.fileName}</p>
                    <a href={`/api/files/${file.id}`} target="_blank" rel="noopener noreferrer">
                      <Download className="w-3 h-3 text-gray-400 hover:text-gray-900 transition" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadOnlyTreeNode({ node, expanded, toggle, level }: { node: any; expanded: Set<string>; toggle: (id: string) => void; level: number }) {
  const isFolder = node.type === "folder";
  const isOpen = expanded.has(node.id);

  if (!isFolder) return <ReadOnlyFileRow file={node} level={level} />;

  return (
    <div>
      <div
        className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition group cursor-pointer"
        style={{ paddingLeft: `${8 + level * 20}px` }}
        onClick={() => toggle(node.id)}
      >
        <button className="text-gray-400 shrink-0">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <Folder className="w-4 h-4 text-yellow-500 shrink-0" />
        <span className="flex-1 text-sm font-medium text-gray-700">{node.name}</span>
        <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition">
          {node.children.length} item{node.children.length !== 1 ? "s" : ""}
        </span>
      </div>
      {isOpen && node.children.map((child: any) => (
        <ReadOnlyTreeNode key={child.id} node={child} expanded={expanded} toggle={toggle} level={level + 1} />
      ))}
    </div>
  );
}

function ReadOnlyFileRow({ file, level }: { file: any; level: number }) {
  return (
    <div
      className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition group"
      style={{ paddingLeft: `${28 + level * 20}px` }}
    >
      <File className="w-3.5 h-3.5 text-gray-400 shrink-0" />
      <span className="flex-1 text-sm text-gray-700 truncate">{file.fileName ?? file.file_name}</span>
      {file.fileSize && (
        <span className="text-[10px] text-gray-400 shrink-0">{formatSize(file.fileSize)}</span>
      )}
      <a
        href={`/api/files/${file.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="opacity-0 group-hover:opacity-100 transition"
        onClick={(e) => e.stopPropagation()}
      >
        <Download className="w-3.5 h-3.5 text-gray-500 hover:text-gray-900 transition" />
      </a>
    </div>
  );
}

/* ─────────────────────────────────────────
   SCHEDULE CALL TAB
───────────────────────────────────────── */
function ScheduleTab({ teamName, members }: { teamName: string; members: Member[] }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [meetings, setMeetings] = useState<ScheduledMeeting[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("10:00");
  const [link, setLink] = useState("");

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const monthName = new Date(viewYear, viewMonth).toLocaleString("en-US", { month: "long" });

  const meetingsByDate = useMemo(() => {
    const map: Record<string, ScheduledMeeting[]> = {};
    meetings.forEach((m) => {
      if (!map[m.date]) map[m.date] = [];
      map[m.date].push(m);
    });
    return map;
  }, [meetings]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(v => v - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(v => v + 1); }
    else setViewMonth(m => m + 1);
  }

  function formatDateKey(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function handleAddMeeting() {
    if (!selectedDate || !title.trim()) return;
    setMeetings((prev) => [
      ...prev,
      { id: Date.now().toString(), title: title.trim(), date: selectedDate, time, link: link.trim() },
    ]);
    setTitle("");
    setLink("");
    setTime("10:00");
    setShowForm(false);
  }

  function deleteMeeting(id: string) {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  }

  const selectedMeetings = selectedDate ? (meetingsByDate[selectedDate] ?? []) : [];
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="lg:col-span-2 border border-gray-100 rounded-2xl overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
              <ChevronRight className="w-4 h-4 rotate-180 text-gray-500" />
            </button>
            <p className="text-sm font-bold text-gray-900">{monthName} {viewYear}</p>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-50">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="py-2 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="py-3" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const key = formatDateKey(viewYear, viewMonth, day);
              const isToday = key === todayKey;
              const isSelected = key === selectedDate;
              const hasMeeting = !!meetingsByDate[key]?.length;
              return (
                <button
                  key={day}
                  onClick={() => { setSelectedDate(key); setShowForm(false); }}
                  className={`py-3 flex flex-col items-center gap-0.5 transition rounded-none hover:bg-gray-50 ${isSelected ? "bg-gray-900 hover:bg-gray-900" : ""}`}
                >
                  <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                    isSelected ? "text-white" : isToday ? "bg-gray-100 text-gray-900" : "text-gray-700"
                  }`}>
                    {day}
                  </span>
                  {hasMeeting && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-gray-900"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Selected day panel */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {selectedDate ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) : "Select a date"}
                </p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  {selectedMeetings.length === 0 ? "No calls scheduled" : `${selectedMeetings.length} call${selectedMeetings.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              {selectedDate && (
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {showForm && (
              <div className="px-5 py-4 border-b border-gray-100 space-y-3 bg-gray-50">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Meeting title"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-gray-900 transition"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Time</p>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-gray-900 transition"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Meeting Link</p>
                    <input
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-gray-900 transition"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddMeeting}
                    disabled={!title.trim()}
                    className="flex-1 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition"
                  >
                    Schedule
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-white transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="divide-y divide-gray-50">
              {selectedMeetings.length === 0 && !showForm && (
                <div className="px-5 py-6 text-center">
                  <CalendarClock className="w-6 h-6 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">{selectedDate ? "No meetings on this day" : "Pick a date to see meetings"}</p>
                </div>
              )}
              {selectedMeetings.map((m) => (
                <div key={m.id} className="px-5 py-3 flex items-start gap-3 group">
                  <div className="p-1.5 rounded-lg bg-gray-100 shrink-0 mt-0.5">
                    <Video className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{m.time}</span>
                      {m.link && (
                        <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-900 underline underline-offset-2 truncate">
                          Join
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMeeting(m.id)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 rounded-lg hover:bg-gray-100"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 transition" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Team members */}
          <div className="border border-gray-100 rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Notify</p>
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-2.5">
                  <LocalAvatar name={`${m.firstName} ${m.lastName}`} size={28} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{m.firstName} {m.lastName}</p>
                    <p className="text-[10px] text-gray-400 truncate">{m.email}</p>
                  </div>
                  {m.role === "LEADER" && <Crown className="w-3 h-3 text-gray-400 shrink-0" />}
                </div>
              ))}
              {members.length === 0 && <p className="text-xs text-gray-400">No members yet</p>}
            </div>
          </div>
        </div>
      </div>

      {/* All upcoming meetings */}
      {meetings.length > 0 && (
        <div className="border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">All Scheduled Calls</p>
          </div>
          <div className="divide-y divide-gray-50">
            {meetings.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).map((m) => (
              <div key={m.id} className="px-5 py-3 flex items-center gap-4 group hover:bg-gray-50 transition">
                <div className="text-center shrink-0 w-10">
                  <p className="text-xs font-bold text-gray-900">
                    {new Date(m.date + "T00:00:00").toLocaleDateString("en-US", { day: "numeric" })}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase">
                    {new Date(m.date + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}
                  </p>
                </div>
                <div className="w-px h-8 bg-gray-100" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{m.time}</span>
                    {m.link && (
                      <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-900 underline underline-offset-2 ml-1">
                        Join call
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteMeeting(m.id)}
                  className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 transition" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
