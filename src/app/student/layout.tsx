"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import { Menu, Bell } from "lucide-react";
import Footer from "@/src/components/layout/Footer";
import { useRouter } from "next/navigation";
import { createClientSupabase } from "../../lib/supabase-client";
import { playChime } from "../../lib/chime";
import Avatar from "../../components/ui/Avatar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [userProfile, setUserProfile] = useState<{
    first_name: string;
    email: string;
    avatar_url?: string | null;
  } | null>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const router = useRouter();

  /* stable references — never recreated on re-render */
  const supabaseRef = useRef(createClientSupabase());
  const channelRef = useRef<ReturnType<typeof supabaseRef.current.channel> | null>(null);

  const handleLogout = async () => {
    await supabaseRef.current.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    /* guard: only run once even in React Strict Mode double-invoke */
    if (channelRef.current) return;

    const supabase = supabaseRef.current;

    const setup = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, email, avatar_url")
        .eq("id", user.id)
        .single();

      if (profile) setUserProfile(profile);

      const { data: initialNotifications } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (initialNotifications) {
        setNotifications(initialNotifications);
        setUnreadCount(initialNotifications.filter((n) => !n.read).length);
      }

      const channel = supabase
        .channel(`notif:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((prev) => [payload.new as any, ...prev.slice(0, 19)]);
            setUnreadCount((prev) => prev + 1);
            playChime();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.new.id ? { ...n, ...(payload.new as any) } : n))
            );
            setUnreadCount((prev) =>
              (payload.new as any).read && !(payload.old as any).read
                ? Math.max(0, prev - 1)
                : prev
            );
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("[notif] realtime subscribed for", user.id);
          } else {
            console.warn("[notif] realtime status:", status);
          }
        });

      channelRef.current = channel;
    };

    setup();

    return () => {
      if (channelRef.current) {
        supabaseRef.current.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const markAsRead = async (id: string) => {
    await supabaseRef.current.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const clearReadNotifications = async () => {
    const { data: { user } } = await supabaseRef.current.auth.getUser();
    if (!user) return;
    await supabaseRef.current.from("notifications").delete().eq("user_id", user.id).eq("read", true);
    setNotifications((prev) => prev.filter((n) => !n.read));
  };

  return (
    <div className="min-h-screen flex relative bg-[#0A0A0A] text-zinc-100">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isDesktopOpen={isDesktopOpen}
        isMobileOpen={isMobileOpen}
      />

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <div className="px-6 md:px-8 py-4 flex items-center justify-between bg-[#0A0A0A] border-b border-white/5">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition"
            >
              <Menu className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsDesktopOpen(!isDesktopOpen)}
              className="hidden md:block p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationOpen(!notificationOpen);
                  setProfileOpen(false);
                }}
                className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full" />
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <p className="text-sm font-semibold text-zinc-100">
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-2 text-xs font-semibold bg-white text-black px-1.5 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button
                          onClick={async () => {
                            const { data: { user } } = await supabaseRef.current.auth.getUser();
                            if (!user) return;
                            await supabaseRef.current
                              .from("notifications")
                              .update({ read: true })
                              .eq("user_id", user.id)
                              .eq("read", false);
                            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                            setUnreadCount(0);
                          }}
                          className="text-xs text-zinc-400 hover:text-white transition"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={clearReadNotifications}
                        className="text-xs text-zinc-500 hover:text-zinc-300 transition"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 && (
                      <p className="text-sm text-zinc-500 text-center py-6">
                        No notifications yet.
                      </p>
                    )}
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (!n.read) markAsRead(n.id);
                        }}
                        className={`px-4 py-3 cursor-pointer transition border-b border-white/5 last:border-0 ${
                          n.read
                            ? "hover:bg-white/5"
                            : "bg-white/5 hover:bg-white/10 border-l-2 border-l-white"
                        }`}
                      >
                        <p className="text-sm font-medium text-zinc-100">
                          {n.title}
                        </p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {n.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationOpen(false);
                }}
                className="focus:outline-none"
              >
                <Avatar
                  name={userProfile?.first_name}
                  avatarUrl={userProfile?.avatar_url}
                  size={34}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm font-semibold text-zinc-100">
                      {userProfile?.first_name}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {userProfile?.email}
                    </p>
                  </div>

                  <button
                    onClick={() => router.push("/student/profile")}
                    className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 transition"
                  >
                    Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition border-t border-white/5"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Canvas */}
        <div className="flex-1 w-full bg-[#0A0A0A]">
          <div className="px-6 md:px-8 max-w-6xl mx-auto pb-12 pt-8 space-y-8">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="w-full border-t border-white/5 bg-[#0A0A0A]">
          <div className="px-6 md:px-8 max-w-6xl mx-auto opacity-70">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}
