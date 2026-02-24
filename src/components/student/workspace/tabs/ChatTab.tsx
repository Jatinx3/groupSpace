"use client";

import { useEffect, useRef, useState } from "react";
import { createClientSupabase } from "../../../../lib/supabase-client";
import { Send, Smile, Paperclip, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    id: string;
    full_name: string;
  } | null;
};

type Props = {
  teamId: string;
  initialMessages: Message[];
  currentUserId: string;
};

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export default function ChatTab({
  teamId,
  initialMessages,
  currentUserId,
}: Props) {
  const supabase = createClientSupabase();

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const messageContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);

  /* ================= FIXED AUTO SCROLL ================= */

  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;

    if (isInitialLoadRef.current) {
      // instant scroll on first load
      container.scrollTop = container.scrollHeight;
      isInitialLoadRef.current = false;
    } else {
      // smooth scroll for new messages only
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  /* ================= FETCH ================= */

  const fetchMessages = async () => {
    const { data: raw } = await supabase
      .from("messages")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: true });

    if (!raw) return;

    const userIds = raw.map((m) => m.user_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", userIds);

    const merged = raw.map((msg) => {
      const profile = profiles?.find((p) => p.id === msg.user_id);
      return {
        ...msg,
        profiles: profile
          ? {
              id: profile.id,
              full_name: `${profile.first_name} ${profile.last_name}`,
            }
          : null,
      };
    });

    setMessages(merged);
  };

  /* ================= FILE UPLOAD ================= */

  const handleFileChange = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      alert("File exceeds 50MB limit.");
      return;
    }
    setSelectedFile(file);
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    const filePath = `${teamId}/${Date.now()}-${selectedFile.name}`;

    const { error } = await supabase.storage
      .from("chat-media")
      .upload(filePath, selectedFile);

    if (error) {
      console.error(error);
      return null;
    }

    return filePath;
  };

  const getSignedUrl = async (path: string) => {
    const { data } = await supabase.storage
      .from("chat-media")
      .createSignedUrl(path, 60 * 60);

    return data?.signedUrl || null;
  };

  /* ================= SEND ================= */

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || sending) return;

    setSending(true);

    let content = newMessage.trim();

    if (selectedFile) {
      const filePath = await uploadFile();
      if (filePath) {
        content += `\n__FILE__${filePath}`;
      }
    }

    const optimistic: Message = {
      id: crypto.randomUUID(),
      content,
      created_at: new Date().toISOString(),
      user_id: currentUserId,
      profiles: { id: currentUserId, full_name: "You" },
    };

    setMessages((prev) => [...prev, optimistic]);

    await supabase.from("messages").insert({
      team_id: teamId,
      user_id: currentUserId,
      content,
    });

    setNewMessage("");
    setSelectedFile(null);
    setSending(false);

    await fetchMessages();
  };

  const getInitials = (name?: string) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "U";

  const emojis = ["😀", "🔥", "🚀", "💡", "🎉", "👍", "😂", "❤️"];

  /* ================= RENDER ================= */

  return (
  <div className="h-full">
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[70vh] max-h-[680px] overflow-hidden">

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 font-semibold sticky top-0 bg-white z-10">
        Team Chat
      </div>

      {/* Messages */}
      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto px-8 py-8 space-y-6 bg-gray-50"
      >
        <AnimatePresence>
          {messages.map((msg, index) => {
            const isOwn = msg.user_id === currentUserId;
            const name = msg.profiles?.full_name || "Unknown";

            const prevMsg = messages[index - 1];
            const isSameSender =
              prevMsg && prevMsg.user_id === msg.user_id;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className={`flex ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                <div className="max-w-[65%]">

                  {/* Show name only if sender changes */}
                  {!isOwn && !isSameSender && (
                    <div className="text-xs text-gray-500 mb-1 ml-1">
                      {name}
                    </div>
                  )}

                  <div
                    className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isOwn
                        ? "bg-black text-white rounded-br-md"
                        : "bg-white border border-gray-200 rounded-bl-md"
                    }`}
                  >
                    {msg.content.split("\n").map((line, i) => {
                      if (line.startsWith("__FILE__")) {
                        const filePath = line.replace("__FILE__", "");
                        return (
                          <FilePreview
                            key={i}
                            filePath={filePath}
                            getSignedUrl={getSignedUrl}
                          />
                        );
                      }
                      return <p key={i}>{line}</p>;
                    })}
                  </div>

                  {/* Timestamp */}
                  <div
                    className={`text-[11px] text-gray-400 mt-1 ${
                      isOwn ? "text-right mr-1" : "ml-1"
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Input Bar */}
      <div className="border-t border-gray-100 bg-white px-6 py-4">
        {selectedFile && (
          <div className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-xl mb-3 text-sm">
            <span className="truncate">{selectedFile.name}</span>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-400 hover:text-black"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">

          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-2 hover:bg-gray-100 rounded-xl transition"
          >
            <Smile size={18} />
          </button>

          <label className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer transition">
            <Paperclip size={18} />
            <input
              type="file"
              hidden
              onChange={(e) =>
                e.target.files && handleFileChange(e.target.files[0])
              }
            />
          </label>

          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-gray-100 rounded-full px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />

          <button
            onClick={sendMessage}
            disabled={sending}
            className="bg-black text-white p-3 rounded-full hover:opacity-80 transition disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>

        {showEmoji && (
          <div className="absolute bottom-20 left-6 bg-white border border-gray-200 rounded-2xl shadow-lg p-3 flex gap-2">
            {emojis.map((e) => (
              <button
                key={e}
                onClick={() => {
                  setNewMessage((prev) => prev + e);
                  setShowEmoji(false);
                }}
                className="text-lg hover:scale-110 transition"
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);}

/* ================= FILE PREVIEW ================= */

function FilePreview({
  filePath,
  getSignedUrl,
}: {
  filePath: string;
  getSignedUrl: (path: string) => Promise<string | null>;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    getSignedUrl(filePath).then(setUrl);
  }, [filePath]);

  if (!url) return <p className="mt-2 text-xs">Loading...</p>;

  const fileName = filePath.split("/").pop() || "file";
  const cleanName = fileName.replace(/^\d+-/, "");
  const extension = cleanName.split(".").pop()?.toLowerCase();

  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "heic"].includes(
    extension || ""
  );

  const isVideo = ["mp4", "webm", "ogg"].includes(extension || "");

  if (isImage) {
    return (
      <div className="mt-3">
        <img
          src={url}
          alt={cleanName}
          className="rounded-xl max-h-80 object-cover"
        />
      </div>
    );
  }

  if (isVideo) {
    return (
      <video
        src={url}
        controls
        className="mt-3 rounded-xl max-h-80"
      />
    );
  }

  return (
    <div className="mt-3">
      <a
        href={url}
        download={cleanName}
        target="_blank"
        className="flex items-center gap-2 text-sm underline hover:opacity-80"
      >
        <span>📎</span>
        <span>{cleanName}</span>
      </a>
    </div>
  );
}