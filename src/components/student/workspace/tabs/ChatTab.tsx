"use client";

import { useEffect, useRef, useState } from "react";
import { createClientSupabase } from "../../../../lib/supabase-client";
import { Send } from "lucide-react";

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

export default function ChatTab({
  teamId,
  initialMessages,
  currentUserId,
}: Props) {
  const supabase = createClientSupabase();

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  /* ========================= */
  /* Auto Scroll */
  /* ========================= */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ========================= */
  /* Fetch Latest Messages */
  /* ========================= */

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select(
        `
        id,
        content,
        created_at,
        user_id,
        profiles (
          id,
          full_name
        )
      `
      )
      .eq("team_id", teamId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  /* ========================= */
  /* Send Message */
  /* ========================= */

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Optimistic UI
    const optimisticMessage: Message = {
      id: crypto.randomUUID(),
      content: messageContent,
      created_at: new Date().toISOString(),
      user_id: currentUserId,
      profiles: {
        id: currentUserId,
        full_name: "You",
      },
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    await supabase.from("messages").insert({
      team_id: teamId,
      user_id: currentUserId,
      content: messageContent,
    });

    // Refresh from DB to sync properly
    await fetchMessages();

    setSending(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  /* ========================= */
  /* UI */
  /* ========================= */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Chat</h2>
        <p className="text-gray-500">
          Collaborate with your team in real-time
        </p>
      </div>

      {/* Chat Card */}
      <div className="bg-white rounded-2xl border border-gray-200 flex flex-col h-[600px]">
        {/* Card Title */}
        <div className="px-6 py-4 border-b border-gray-200 font-medium">
          Team Chat
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-10">
              No messages yet.
            </div>
          )}

          {messages.map((msg) => {
            const isOwn = msg.user_id === currentUserId;
            const name = msg.profiles?.full_name || "Unknown User";

            return (
              <div
                key={msg.id}
                className={`flex gap-4 ${
                  isOwn ? "flex-row-reverse text-right" : ""
                }`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
                  {getInitials(name)}
                </div>

                {/* Message Content */}
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
                    className={`mt-2 px-4 py-3 rounded-xl text-sm ${
                      isOwn
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4 flex items-center gap-3">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none"
          />

          <button
            onClick={sendMessage}
            disabled={sending}
            className="bg-black text-white p-3 rounded-xl hover:opacity-80 transition disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}