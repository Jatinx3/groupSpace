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

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

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

  const bottomRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);

  /* ========================= */
  /* Auto Scroll (No Jump On Mount) */
  /* ========================= */

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ========================= */
  /* Fetch Messages */
  /* ========================= */

  const fetchMessages = async () => {
  const { data: rawMessages } = await supabase
    .from("messages")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: true });

  if (!rawMessages) return;

  const userIds = rawMessages.map((m) => m.user_id);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .in("id", userIds);

  const merged = rawMessages.map((msg) => {
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
  /* ========================= */
  /* File Upload */
  /* ========================= */

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

  console.log("Uploading:", selectedFile.name);
  console.log("Path:", filePath);

  const { error } = await supabase.storage
    .from("chat-media")
    .upload(filePath, selectedFile);

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data } = supabase.storage
    .from("chat-media")
    .getPublicUrl(filePath);

  console.log("Public URL:", data.publicUrl);

  return data.publicUrl;
};

  /* ========================= */
  /* Send Message */
  /* ========================= */

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || sending) return;

    setSending(true);

    let content = newMessage.trim();

    if (selectedFile) {
      const fileUrl = await uploadFile();
      if (fileUrl) {
        content += `\n${fileUrl}`;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[70vh] overflow-hidden">

        {/* Top */}
        <div className="px-6 py-4 border-b border-gray-100 font-medium">
          Team Chat
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 bg-gradient-to-b from-white to-gray-50">
          <AnimatePresence>
            {messages.map((msg) => {
              const isOwn = msg.user_id === currentUserId;
              const name = msg.profiles?.full_name || "Unknown User";

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-4 ${
                    isOwn ? "flex-row-reverse text-right" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold shadow-sm">
                    {getInitials(name)}
                  </div>

                  <div className="max-w-xl">
                    <div className="text-sm font-medium flex gap-2 items-center">
                      {isOwn ? "You" : name}
                      <span className="text-gray-400 text-xs font-normal">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div
  className={`mt-2 px-5 py-3 rounded-2xl text-sm shadow-sm ${
    isOwn
      ? "bg-black text-white"
      : "bg-white border border-gray-200"
  }`}
>
  
{msg.content.split("\n").map((line, i) => {
  const isUrl =
    line.startsWith("http://") || line.startsWith("https://");

  if (!isUrl) {
    return <p key={i}>{line}</p>;
  }

  const isImage = line.match(/\.(jpeg|jpg|png|gif|webp|heic)$/i);
  const isVideo = line.match(/\.(mp4|webm|ogg)$/i);

  if (isImage) {
    return (
      <div key={i} className="mt-3">
        <img
          src={line}
          alt="uploaded"
          className="rounded-xl max-h-72 object-cover border"
        />
      </div>
    );
  }

  if (isVideo) {
    return (
      <video
        key={i}
        src={line}
        controls
        className="mt-3 rounded-xl max-h-72 border"
      />
    );
  }

  return (
    <a
      key={i}
      href={line}
      target="_blank"
      className="block mt-2 text-blue-500 underline"
    >
      Download file
    </a>
  );
})}
</div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 p-4 bg-white backdrop-blur-md">
          {selectedFile && (
            <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-xl mb-3 text-sm">
              <span>{selectedFile.name}</span>
              <button onClick={() => setSelectedFile(null)}>
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 relative">
            {/* Emoji Button */}
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Smile size={18} />
            </button>

            {/* File Upload */}
            <label className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
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
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 bg-gray-100 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
            />

            <button
              onClick={sendMessage}
              disabled={sending}
              className="bg-black text-white p-3 rounded-2xl hover:opacity-80 transition disabled:opacity-40"
            >
              <Send size={16} />
            </button>

            {/* Emoji Picker */}
            {showEmoji && (
              <div className="absolute bottom-14 left-0 bg-white border border-gray-200 rounded-2xl shadow-lg p-3 flex gap-2">
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
    </div>
  );
}