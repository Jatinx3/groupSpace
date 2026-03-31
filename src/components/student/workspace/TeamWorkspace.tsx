"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  CheckSquare,
  Activity,
  FolderTree,
  MessageSquare,
  Folder,
  UserPlus,
  Copy,
  Check,
  Mail,
  X,
  Send,
} from "lucide-react";
import dynamic from "next/dynamic";

import { addMemberByEmail } from "../../../app/student/teams/invite-actions";

// Always-loaded — default visible tab, no cost to eager-load
import TeamTab from "./tabs/TeamTab";

// Skeleton shown while each chunk downloads
function TabSkeleton() {
  return (
    <div className="animate-pulse space-y-4 pt-4">
      <div className="h-8 bg-gray-100 dark:bg-white/5 rounded-xl w-1/3" />
      <div className="h-32 bg-gray-100 dark:bg-white/5 rounded-2xl" />
      <div className="h-24 bg-gray-100 dark:bg-white/5 rounded-2xl" />
    </div>
  );
}

// Lazy-loaded tabs — JS chunks only downloaded when user first clicks them
const TasksTab     = dynamic(() => import("./tabs/TasksTab"),     { loading: () => <TabSkeleton /> });
const ProgressTab  = dynamic(() => import("./tabs/ProgressTab"),  { loading: () => <TabSkeleton /> });
const StructureTab = dynamic(() => import("./tabs/StructureTab"), { loading: () => <TabSkeleton /> });
const FilesTab     = dynamic(() => import("./tabs/FilesTab"),     { loading: () => <TabSkeleton /> });
// ChatTab is always mounted (hidden div) to keep realtime subscription alive;
// dynamic import only defers the initial bundle download
const ChatTab      = dynamic(() => import("./tabs/ChatTab"),      { loading: () => <TabSkeleton />, ssr: false });

import type { Task } from "../../../types/task";
import type { Member } from "../../../types/member";

type Message = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  } | null;
};

interface Props {
  teamId: string;
  teamName: string;
  courseName?: string;
  inviteCode: string;
  members: Member[];
  tasks: Task[];
  files: any[];
  folders: any[];
  isLeader: boolean;
  messages: Message[];
  currentUserId: string;
  onDelete?: () => void;
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
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const codeChunks = inviteCode.match(/.{1,4}/g) ?? [inviteCode];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    if (!email.trim()) return;
    setStatus("idle");
    setErrorMsg("");
    startTransition(async () => {
      const result = await addMemberByEmail(teamId, email.trim());
      if ("error" in result) {
        setErrorMsg(result.error);
        setStatus("error");
      } else {
        setEmail("");
        setStatus("success");
        setTimeout(() => {
          router.refresh();
          onClose();
        }, 1500);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#111111] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:flex-row dark:border dark:border-white/10">

        {/* LEFT — dark code panel */}
        <div className="bg-gray-900 sm:w-[52%] px-8 py-8 flex flex-col justify-between relative">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition sm:hidden"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top label */}
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

            {/* Big code display */}
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

            {/* Decorative dots grid */}
            <div className="mt-6 grid grid-cols-8 gap-1.5">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: `rgba(255,255,255,${Math.random() * 0.25 + 0.05})` }}
                />
              ))}
            </div>
          </div>

          {/* Copy button */}
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

          {/* Member count pill */}
          <div className="mt-3 flex items-center gap-1.5">
            <Users className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500">
              {memberCount} member{memberCount !== 1 ? "s" : ""} already in
            </span>
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Or invite directly</p>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mt-0.5">Add by email</h2>
              </div>
              <button
                onClick={onClose}
                className="hidden sm:flex w-8 h-8 items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-gray-400 dark:text-zinc-400 mt-3 mb-6 leading-relaxed">
              Enter a teammate's email address and they'll be added to the team instantly.
            </p>

            {/* Email input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 focus-within:border-gray-900 dark:focus-within:border-white/30 focus-within:bg-white dark:focus-within:bg-[#1A1A1A] transition">
                <Mail className="w-4 h-4 text-gray-400 dark:text-zinc-500 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="teammate@university.edu"
                  className="flex-1 py-3 text-sm bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600"
                />
              </div>

              <button
                onClick={handleSend}
                disabled={isPending || !email.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 text-white dark:text-gray-900 rounded-xl text-sm font-bold transition"
              >
                <Send className="w-3.5 h-3.5" />
                {isPending ? "Sending..." : "Send Invite"}
              </button>

              {status === "success" && (
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-3 py-2.5">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Member added successfully!</p>
                </div>
              )}
              {status === "error" && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2.5">
                  <span className="text-red-500 dark:text-red-400 text-sm leading-none mt-0.5">⚠</span>
                  <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom tip */}
          <div className="mt-8 flex items-start gap-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-zinc-600 mt-1.5 shrink-0" />
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
              Only share the invite code with people you trust. Anyone with the code can request to join.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamWorkspace({
  teamId,
  teamName,
  courseName,
  inviteCode,
  members,
  tasks,
  files,
  folders,
  isLeader,
  messages,
  currentUserId,
}: Props) {
  const [activeTab, setActiveTab] = useState("team");
  const [showInvite, setShowInvite] = useState(false);
  const [unreadCount, setUnreadCount] = useState(() => {
    if (typeof window === "undefined") return 0;
    const lastSeen = localStorage.getItem(`chat_last_seen_${teamId}`);
    if (!lastSeen) return 0;
    return messages.filter(
      (m) => m.user_id !== currentUserId && new Date(m.created_at) > new Date(lastSeen)
    ).length;
  });

  const handleTabClick = (key: string) => {
    setActiveTab(key);
    if (key === "chat") {
      setUnreadCount(0);
      if (typeof window !== "undefined") {
        localStorage.setItem(`chat_last_seen_${teamId}`, new Date().toISOString());
      }
    }
  };

  const tabs = [
    { key: "team", label: "Team", icon: Users },
    { key: "tasks", label: "Tasks", icon: CheckSquare },
    { key: "progress", label: "Progress", icon: Activity },
    { key: "structure", label: "Structure", icon: FolderTree },
    { key: "chat", label: "Chat", icon: MessageSquare, badge: unreadCount },
    { key: "files", label: "Files", icon: Folder },
  ];

  function renderTab() {
    switch (activeTab) {
      case "team":
        return <TeamTab teamName={teamName} members={members} tasks={tasks} />;
      case "tasks":
        return <TasksTab tasks={tasks} teamId={teamId} isLeader={isLeader} members={members} />;
      case "progress":
        return <ProgressTab tasks={tasks} />;
      case "structure":
        return <StructureTab teamId={teamId} folders={folders} files={files} isLeader={isLeader} />;
      case "files":
        return <FilesTab teamId={teamId} files={files} isLeader={isLeader} />;
      default:
        return null;
    }
  }

  return (
    <div className="py-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {teamName}
            </h1>
            {courseName && (
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{courseName}</p>
            )}
          </div>

          {isLeader && (
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 text-sm font-semibold rounded-xl transition shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              Invite Members
            </button>
          )}
        </div>

        {/* TABS */}
        <div className="flex gap-1 border-b border-gray-100 dark:border-white/10 pb-0 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            const badge = (tab as any).badge as number | undefined;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition whitespace-nowrap border-b-2 -mb-px ${
                  active
                    ? "border-gray-900 dark:border-white text-gray-900 dark:text-white bg-white dark:bg-[#111111]"
                    : "border-transparent text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-300 hover:bg-gray-50 dark:hover:bg-[#151515]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
                {badge != null && badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ChatTab always stays mounted so realtime subscription is never killed */}
        <div className={activeTab === "chat" ? "h-[calc(100vh-260px)] min-h-[480px]" : "hidden"}>
          <ChatTab
            teamId={teamId}
            initialMessages={messages}
            currentUserId={currentUserId}
            members={members}
            isActive={activeTab === "chat"}
            onNewMessage={() => setUnreadCount((c) => c + 1)}
          />
        </div>

        {activeTab !== "chat" && (
          <div>{renderTab()}</div>
        )}
      </div>

      {showInvite && (
        <InviteModal
          teamName={teamName}
          teamId={teamId}
          inviteCode={inviteCode}
          memberCount={members.length}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  );
}