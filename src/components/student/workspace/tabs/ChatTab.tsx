"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClientSupabase } from "../../../../lib/supabase-client";
import {
  Send, Smile, Paperclip, X, Search, MoreHorizontal,
  Users, ArrowDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Member } from "../../../../types/member";
import { sendChatNotifications } from "../../../../app/student/teams/actions";
import Avatar from "../../../ui/Avatar";
import { useProfile } from "../../../providers/ProfileProvider";

type Message = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: { id: string; full_name: string; avatar_url?: string | null } | null;
};

type Props = {
  teamId: string;
  initialMessages: Message[];
  currentUserId: string;
  members: (Member & { avatar_url?: string | null })[];
  isActive?: boolean;
  onNewMessage?: () => void;
};

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const EMOJIS = [
  "😀","😂","😍","🥰","😎","🤔","😅","🎉",
  "🔥","💯","👍","❤️","🚀","💡","✅","⚡",
  "😭","🙌","👏","💪","🤝","🎯","📌","🗂️",
];

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

/* ── Split message into text lines and file paths ── */
function parseContent(content: string) {
  const lines = content.split("\n");
  const textLines: string[] = [];
  const filePaths: string[] = [];
  lines.forEach((l) => {
    if (l.startsWith("__FILE__")) filePaths.push(l.replace("__FILE__", ""));
    else if (l.trim()) textLines.push(l);
  });
  return { textLines, filePaths };
}

export default function ChatTab({ teamId, initialMessages, currentUserId, members, isActive, onNewMessage }: Props) {
  /* stable client — never recreated across renders */
  const supabaseRef = useRef(createClientSupabase());
  const supabase = supabaseRef.current;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { profile: currentUserProfile } = useProfile();

  /* ── UI state ── */
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);

  /* ── Signed URL cache ── */
  const urlCache = useRef<Record<string, string>>({});

  /* ── Profile cache for realtime messages ── */
  const profileCache = useRef<Record<string, { fullName: string; avatarUrl: string | null }>>({});

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isInitialLoadRef = useRef(true);
  const emojiRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /* stable ref so realtime callback always has latest value without re-subscribing */
  const isActiveRef = useRef(isActive);
  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
  const onNewMessageRef = useRef(onNewMessage);
  useEffect(() => { onNewMessageRef.current = onNewMessage; }, [onNewMessage]);

  /* ── Pre-populate profile cache from initial messages ── */
  useEffect(() => {
    initialMessages.forEach((m) => {
      if (m.profiles?.id) {
        profileCache.current[m.profiles.id] = {
          fullName: m.profiles.full_name,
          avatarUrl: m.profiles.avatar_url ?? null,
        };
      }
    });
  }, []);

  /* ── Auto scroll ── */
  const scrollToBottom = useCallback((instant = false) => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (instant) el.scrollTop = el.scrollHeight;
    else el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isInitialLoadRef.current) {
      scrollToBottom(true);
      isInitialLoadRef.current = false;
    } else {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  /* ── Close dropdowns on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmoji(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Search input focus ── */
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  /* ── Realtime: process INSERT payload directly, no full re-fetch ── */
  useEffect(() => {
    const client = supabaseRef.current;

    const channel = client
      .channel(`chat-room:${teamId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `team_id=eq.${teamId}` },
        async (payload) => {
          const raw = payload.new as { id: string; content: string; created_at: string; user_id: string };

          /* resolve sender name — use cache first */
          let cached = profileCache.current[raw.user_id];
          if (!cached) {
            const { data: p } = await client
              .from("profiles")
              .select("first_name, last_name, avatar_url")
              .eq("id", raw.user_id)
              .single();
            if (p) {
              cached = {
                fullName: `${p.first_name} ${p.last_name}`,
                avatarUrl: p.avatar_url,
              };
              profileCache.current[raw.user_id] = cached;
            }
          }

          const incoming: Message = {
            id: raw.id,
            content: raw.content,
            created_at: raw.created_at,
            user_id: raw.user_id,
            profiles: cached ? { id: raw.user_id, full_name: cached.fullName, avatar_url: cached.avatarUrl } : null,
          };

          setMessages((prev) => {
            /* drop if already present (optimistic update from sender) */
            if (prev.some((m) => m.id === raw.id)) return prev;
            /* fire unread badge when tab is not visible and message is from someone else */
            if (!isActiveRef.current && raw.user_id !== currentUserId) {
              onNewMessageRef.current?.();
            }
            return [...prev, incoming];
          });
        }
      )
      .subscribe();

    return () => { client.removeChannel(channel); };
  }, [teamId]); /* teamId only — supabaseRef is a stable ref */

  /* ── File ── */
  const handleFileChange = (file: File) => {
    if (file.size > MAX_FILE_SIZE) { alert("File exceeds 50MB limit."); return; }
    setSelectedFile(file);
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!selectedFile) return null;
    const filePath = `${teamId}/${Date.now()}-${selectedFile.name}`;
    const { error } = await supabaseRef.current.storage.from("chat-media").upload(filePath, selectedFile);
    if (error) { console.error(error); return null; }
    return filePath;
  };

  const getSignedUrl = useCallback(async (path: string): Promise<string | null> => {
    if (urlCache.current[path]) return urlCache.current[path];
    const { data } = await supabaseRef.current.storage.from("chat-media").createSignedUrl(path, 3600);
    if (data?.signedUrl) { urlCache.current[path] = data.signedUrl; return data.signedUrl; }
    return null;
  }, []);

  /* ── Send ── */
  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || sending) return;
    setSending(true);
    let content = newMessage.trim();
    if (selectedFile) {
      const filePath = await uploadFile();
      if (filePath) content += `\n__FILE__${filePath}`;
    }
    const senderName = currentUserProfile ? `${currentUserProfile.first_name} ${currentUserProfile.last_name}` : "You";
    const optimistic: Message = {
      id: crypto.randomUUID(), content, created_at: new Date().toISOString(),
      user_id: currentUserId, profiles: { id: currentUserId, full_name: senderName, avatar_url: currentUserProfile?.avatar_url },
    };
    setMessages((prev) => [...prev, optimistic]);
    await supabaseRef.current.from("messages").insert({ team_id: teamId, user_id: currentUserId, content });
    const otherMembers = members.filter((m) => m.id !== currentUserId);
    if (otherMembers.length > 0) {
      const sender = members.find((m) => m.id === currentUserId);
      const senderName = sender ? `${sender.first_name} ${sender.last_name}`.trim() : "A team member";
      const preview = content.replace(/__FILE__\S+/g, "📎 file").slice(0, 80);
      await sendChatNotifications(otherMembers.map((m) => m.id), senderName, preview);
    }
    setNewMessage("");
    setSelectedFile(null);
    setSending(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  /* ── Filter + group messages ── */
  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.profiles?.full_name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const grouped: { date: string; messages: Message[] }[] = [];
  filteredMessages.forEach((msg) => {
    const label = formatDateLabel(msg.created_at);
    const last = grouped[grouped.length - 1];
    if (!last || last.date !== label) grouped.push({ date: label, messages: [msg] });
    else last.messages.push(msg);
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-white/10 shrink-0 bg-white dark:bg-[#111111]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center shrink-0">
            <span className="text-white dark:text-gray-900 font-bold text-sm leading-none">#</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">Team Chat</p>
            <p className="text-[11px] text-gray-400 dark:text-zinc-500">{members.length} member{members.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Search toggle */}
          <button
            onClick={() => { setSearchOpen((v) => !v); if (searchOpen) setSearchQuery(""); }}
            className={`p-2 rounded-lg transition ${searchOpen ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white" : "text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white"}`}
          >
            <Search size={15} />
          </button>

          {/* Three-dots menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={`p-2 rounded-lg transition ${menuOpen ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white" : "text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white"}`}
            >
              <MoreHorizontal size={15} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg z-50 py-1 overflow-hidden"
                >
                  <button
                    onClick={() => { setShowMembersPanel((v) => !v); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5 transition text-left"
                  >
                    <Users size={14} className="text-gray-400 dark:text-zinc-500" />
                    {showMembersPanel ? "Hide Members" : "View Members"}
                  </button>
                  <button
                    onClick={() => { scrollToBottom(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5 transition text-left"
                  >
                    <ArrowDown size={14} className="text-gray-400 dark:text-zinc-500" />
                    Jump to Latest
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Search bar ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="border-b border-gray-100 dark:border-white/10 shrink-0 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-[#1A1A1A]">
              <Search size={14} className="text-gray-400 dark:text-zinc-500 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="flex-1 bg-transparent text-sm focus:outline-none text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-white">
                  <X size={14} />
                </button>
              )}
              <span className="text-[11px] text-gray-400 dark:text-zinc-500 shrink-0">
                {filteredMessages.length} result{filteredMessages.length !== 1 ? "s" : ""}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Members panel ── */}
      <AnimatePresence>
        {showMembersPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="border-b border-gray-100 dark:border-white/10 shrink-0 overflow-hidden"
          >
            <div className="px-5 py-3 bg-gray-50 dark:bg-[#1A1A1A]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-2">Members</p>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-1.5 bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1">
                    <Avatar name={`${m.first_name} ${m.last_name}`} avatarUrl={m.avatar_url} size={20} />
                    <span className="text-xs text-gray-700 dark:text-zinc-300">{m.first_name} {m.last_name}</span>
                    {m.role === "LEADER" && (
                      <span className="text-[9px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded px-1 py-0.5 font-semibold">Lead</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Messages ── */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50 dark:bg-[#111111]">
        {filteredMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xl">
              {searchQuery ? "🔍" : "💬"}
            </div>
            <p className="text-gray-500 dark:text-zinc-400 text-sm font-medium">
              {searchQuery ? `No results for "${searchQuery}"` : "No messages yet"}
            </p>
            {!searchQuery && <p className="text-gray-400 dark:text-zinc-500 text-xs">Be the first to say something!</p>}
          </div>
        )}

        {grouped.map(({ date, messages: dayMsgs }) => (
          <div key={date}>
            {/* Date divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
              <span className="text-[11px] font-semibold text-gray-400 dark:text-zinc-500 bg-gray-50 dark:bg-[#111111] px-3 py-1 rounded-full border border-gray-200 dark:border-white/10 shrink-0">
                {date}
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
            </div>

            <div className="space-y-0.5">
              {dayMsgs.map((msg, idx) => {
                const isOwn = msg.user_id === currentUserId;
                const name = msg.profiles?.full_name || "Unknown";
                const firstName = name.split(" ")[0];
                const prevMsg = dayMsgs[idx - 1];
                const isSameSender = prevMsg?.user_id === msg.user_id;
                const showMeta = !isSameSender;
                const { textLines, filePaths } = parseContent(msg.content);

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : "flex-row"} ${showMeta ? "mt-5" : "mt-0.5"}`}
                  >
                    {/* Avatar — always occupies space so bubbles stay aligned */}
                    <div className="shrink-0 w-8 flex flex-col items-center">
                      {showMeta && (
                        <Avatar name={name} avatarUrl={msg.profiles?.avatar_url} size={32} />
                      )}
                    </div>

                    {/* Content column */}
                    <div className={`flex flex-col max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
                      {showMeta && (
                        <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                          <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">{firstName}</span>
                          <span className="text-[10px] text-gray-400 dark:text-zinc-500">{formatTime(msg.created_at)}</span>
                        </div>
                      )}

                      {/* Text bubble — only if there's text */}
                      {textLines.length > 0 && (
                        <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                          isOwn
                            ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-tr-sm"
                            : "bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white rounded-tl-sm shadow-sm"
                        }`}>
                          {searchQuery ? (
                            textLines.map((line, i) => <HighlightText key={i} text={line} query={searchQuery} />)
                          ) : (
                            textLines.map((line, i) => <p key={i}>{line}</p>)
                          )}
                        </div>
                      )}

                      {/* File previews — rendered OUTSIDE the text bubble */}
                      {filePaths.map((path, i) => (
                        <div key={i} className={`mt-1.5 ${isOwn ? "self-end" : "self-start"}`} style={{ maxWidth: 280 }}>
                          <FilePreview filePath={path} getSignedUrl={getSignedUrl} isOwn={isOwn} />
                        </div>
                      ))}

                      {/* Timestamp on consecutive messages */}
                      {!showMeta && (
                        <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5 px-1">{formatTime(msg.created_at)}</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Input bar ── */}
      <div className="shrink-0 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#111111] px-4 pt-3 pb-2 relative">

        {/* Selected file chip */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 mb-2 text-sm overflow-hidden"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip size={13} className="text-gray-500 dark:text-zinc-400 shrink-0" />
                <span className="truncate text-gray-700 dark:text-zinc-200 text-xs">{selectedFile.name}</span>
                <span className="text-gray-400 dark:text-zinc-500 text-[11px] shrink-0">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
              </div>
              <button onClick={() => setSelectedFile(null)} className="ml-2 text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 shrink-0 p-0.5">
                <X size={13} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emoji picker */}
        <AnimatePresence>
          {showEmoji && (
            <motion.div
              ref={emojiRef}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.12 }}
              className="absolute bottom-full left-4 mb-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl p-3 grid grid-cols-8 gap-0.5 z-50"
            >
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => { setNewMessage((p) => p + e); textareaRef.current?.focus(); setShowEmoji(false); }}
                  className="text-xl p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  {e}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input row */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-2xl px-3 py-2 focus-within:border-gray-400 dark:focus-within:border-white/30 focus-within:bg-white dark:focus-within:bg-[#1A1A1A] transition">

          {/* Attachment button */}
          <label className="flex-none cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#2A2A2A] transition">
            <Paperclip size={16} />
            <input type="file" hidden onChange={(e) => e.target.files && handleFileChange(e.target.files[0])} />
          </label>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={newMessage}
            onChange={autoResize}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            className="flex-1 bg-transparent text-sm resize-none focus:outline-none text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 leading-relaxed overflow-y-auto self-center"
            style={{ maxHeight: 120 }}
          />

          {/* Emoji + Send */}
          <div className="flex-none flex items-center gap-1">
            <button
              onClick={() => setShowEmoji((v) => !v)}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${showEmoji ? "bg-gray-200 dark:bg-[#2A2A2A] text-gray-700 dark:text-white" : "text-gray-400 dark:text-zinc-500 hover:bg-gray-200 dark:hover:bg-[#2A2A2A] hover:text-gray-700 dark:hover:text-white"}`}
            >
              <Smile size={16} />
            </button>
            <button
              onClick={sendMessage}
              disabled={sending || (!newMessage.trim() && !selectedFile)}
              className="w-8 h-8 flex items-center justify-center bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-200 disabled:opacity-40 text-white dark:text-gray-900 rounded-xl transition"
            >
              <Send size={14} />
            </button>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1.5 text-center select-none">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

/* ── Highlight search terms ── */
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query) return <p>{text}</p>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return (
    <p>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-500/30 text-gray-900 dark:text-yellow-200 rounded px-0.5">{part}</mark>
          : part
      )}
    </p>
  );
}

/* ── File Preview — rendered OUTSIDE bubbles ── */
function FilePreview({
  filePath, getSignedUrl, isOwn,
}: {
  filePath: string;
  getSignedUrl: (path: string) => Promise<string | null>;
  isOwn: boolean;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    getSignedUrl(filePath).then((u) => {
      if (u) setUrl(u);
      else setError(true);
    });
  }, [filePath, getSignedUrl]);

  const fileName = filePath.split("/").pop() || "file";
  const cleanName = fileName.replace(/^\d+-/, "");
  const ext = cleanName.split(".").pop()?.toLowerCase() ?? "";

  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "heic", "svg"].includes(ext);
  const isVideo = ["mp4", "webm", "ogg", "mov"].includes(ext);

  if (error) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-zinc-500 px-2 py-1">
        <Paperclip size={12} />
        <span className="truncate">{cleanName}</span>
        <span>(unavailable)</span>
      </div>
    );
  }

  if (!url) {
    return (
      <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl border animate-pulse ${isOwn ? "border-white/20 bg-gray-800 dark:bg-white/20 text-white/60 dark:text-gray-200" : "border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-[#1A1A1A] text-gray-400 dark:text-zinc-500"}`}>
        <Paperclip size={12} />
        <span>Loading...</span>
      </div>
    );
  }

  if (isImage && !imgError) {
    return (
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm bg-gray-100 dark:bg-[#1A1A1A]">
        <img
          src={url}
          alt={cleanName}
          className="block w-full object-contain"
          style={{ maxHeight: 220 }}
          onError={() => setImgError(true)}
        />
        <div className="px-2 py-1 bg-white/90 dark:bg-black/90 border-t border-gray-100 dark:border-white/10">
          <a href={url} target="_blank" rel="noreferrer" className="text-[11px] text-gray-500 dark:text-zinc-400 hover:underline truncate block">{cleanName}</a>
        </div>
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm">
        <video src={url} controls className="block w-full" style={{ maxHeight: 220 }} />
      </div>
    );
  }

  /* Generic file download chip */
  const iconMap: Record<string, string> = {
    pdf: "📄", doc: "📝", docx: "📝", xls: "📊", xlsx: "📊",
    ppt: "📋", pptx: "📋", zip: "🗜️", rar: "🗜️", txt: "📃",
  };
  const icon = iconMap[ext] ?? "📎";

  return (
    <a
      href={url}
      download={cleanName}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition hover:opacity-80 ${
        isOwn ? "border-white/20 bg-gray-800 dark:bg-white dark:text-gray-900 text-white" : "border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-zinc-300 shadow-sm"
      }`}
    >
      <span className="text-lg leading-none">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium truncate max-w-[180px]">{cleanName}</p>
        <p className={`text-[10px] mt-0.5 ${isOwn ? "text-white/60 dark:text-black/60" : "text-gray-400 dark:text-zinc-500"}`}>{ext.toUpperCase()} file · tap to download</p>
      </div>
    </a>
  );
}
