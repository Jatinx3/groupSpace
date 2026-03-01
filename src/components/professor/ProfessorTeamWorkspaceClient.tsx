"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClientSupabase } from "../../lib/supabase-client";
import {
  ArrowLeft,
  Send,
  Users,
  MessageSquare,
  FileText,
  CalendarClock,
  File,
  Crown,
} from "lucide-react";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  senderName: string;
}

interface ProjectFile {
  id: string;
  fileName: string;
  fileSize: number | null;
  createdAt: string;
  uploaderName: string;
}

interface Props {
  courseId: string;
  courseName: string;
  teamId: string;
  teamName: string;
  members: Member[];
  initialMessages: Message[];
  files: ProjectFile[];
  currentUserId: string;
  currentUserName: string;
}

type Tab = "info" | "chat" | "files" | "schedule";

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

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0"
    >
      {initials || "?"}
    </div>
  );
}

export default function ProfessorTeamWorkspaceClient({
  courseId,
  courseName,
  teamId,
  teamName,
  members,
  initialMessages,
  files,
  currentUserId,
  currentUserName,
}: Props) {
  const supabase = createClientSupabase();
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel(`prof-team-chat-${teamId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `team_id=eq.${teamId}` },
        async (payload) => {
          const msg = payload.new as any;
          const { data: senderProfile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", msg.user_id)
            .single();
          const senderName = senderProfile
            ? `${senderProfile.first_name} ${senderProfile.last_name}`.trim()
            : "Unknown";
          setMessages((prev) => [
            ...prev,
            { id: msg.id, content: msg.content, createdAt: msg.created_at, userId: msg.user_id, senderName },
          ]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [teamId, supabase]);

  async function handleSend() {
    const content = newMessage.trim();
    if (!content || sending) return;
    setSending(true);
    setNewMessage("");
    try {
      await supabase.from("messages").insert({ team_id: teamId, user_id: currentUserId, content });
    } finally {
      setSending(false);
    }
  }

  const tabs = [
    { key: "info" as Tab, label: "Team Info", icon: Users },
    { key: "chat" as Tab, label: "Chat", icon: MessageSquare, count: messages.length },
    { key: "files" as Tab, label: "Files", icon: FileText, count: files.length },
    { key: "schedule" as Tab, label: "Schedule Call", icon: CalendarClock },
  ];

  return (
    <div className="space-y-6">
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

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Team Workspace</p>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mt-0.5">{teamName}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{courseName} · {members.length} members</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
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
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Members</p>
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                  <Avatar name={`${member.firstName} ${member.lastName}`} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                      {member.role === "LEADER" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                          <Crown className="w-2.5 h-2.5" />
                          Leader
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{member.email}</p>
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-sm text-gray-400">No members found.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="flex flex-col h-[520px]">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No messages yet. Start the conversation.</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.userId === currentUserId;
                return (
                  <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                    <Avatar name={isMe ? currentUserName : msg.senderName} size={32} />
                    <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div className="flex items-center gap-2">
                        {!isMe && <span className="text-xs font-medium text-gray-600">{msg.senderName}</span>}
                        <span className="text-[10px] text-gray-400">{timeAgo(msg.createdAt)}</span>
                      </div>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-gray-900 text-white rounded-tr-sm" : "bg-gray-100 text-gray-900 rounded-tl-sm"}`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t border-gray-100 p-4">
              <div className="flex gap-3 items-end">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Message the team..."
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-200 bg-gray-50 resize-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="p-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white rounded-xl transition shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "files" && (
          <div className="p-6">
            {files.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500">No files uploaded yet</p>
                <p className="text-xs text-gray-400 mt-1">Files submitted by the team will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition">
                    <div className="p-2 rounded-lg bg-gray-100 shrink-0">
                      <File className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
                      <p className="text-xs text-gray-400">
                        {file.uploaderName} · {timeAgo(file.createdAt)}
                        {file.fileSize ? ` · ${formatSize(file.fileSize)}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="p-6 text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <CalendarClock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-base font-semibold text-gray-700">Schedule a Call</p>
            <p className="text-sm text-gray-400 mt-1">Meeting scheduling will be available in a future update.</p>
            <span className="inline-block mt-3 text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Coming soon</span>
          </div>
        )}
      </div>
    </div>
  );
}
