"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import { Menu, Bell } from "lucide-react";
import Footer from "@/src/components/layout/Footer";
import { useRouter } from "next/navigation";
import { createClientSupabase } from "../../lib/supabase-client";
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
  const supabase = createClientSupabase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    let channel: any;

    const setup = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // 🔹 Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, email, avatar_url")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
      }

      // 🔹 Initial notifications fetch
      const { data: initialNotifications } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (initialNotifications) {
        setNotifications(initialNotifications);
        setUnreadCount(
          initialNotifications.filter((n) => !n.read).length
        );
      }

      // 🔹 Realtime subscription
      channel = supabase
        .channel("realtime-notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
          },
          (payload) => {
            if (payload.new.user_id === user.id) {
              setNotifications((prev) => [
                payload.new,
                ...prev.slice(0, 4),
              ]);
              setUnreadCount((prev) => prev + 1);
            }
          }
        )
        .subscribe();
    };

    setup();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);
const markAsRead = async (id: string) => {
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);

  setNotifications((prev) =>
    prev.map((n) =>
      n.id === id ? { ...n, read: true } : n
    )
  );

  setUnreadCount((prev) =>
    prev > 0 ? prev - 1 : 0
  );
};

const clearReadNotifications = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("notifications")
    .delete()
    .eq("user_id", user.id)
    .eq("read", true);

  setNotifications((prev) =>
    prev.filter((n) => !n.read)
  );
};
  return (
    <div className="min-h-screen flex relative bg-white">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isDesktopOpen={isDesktopOpen}
        isMobileOpen={isMobileOpen}
      />

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <div className="px-8 py-5 flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-200 transition"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>

            <button
              onClick={() => setIsDesktopOpen(!isDesktopOpen)}
              className="hidden md:block p-2 rounded-lg hover:bg-slate-200 transition"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-6">
            {/* 🔔 Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationOpen(!notificationOpen);
                  setProfileOpen(false);
                }}
                className="relative text-slate-500 hover:text-slate-900 transition"
              >
                <Bell className="w-5 h-5" />

                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 space-y-3 z-50">
                  <p className="text-sm font-semibold text-slate-900">
                    Notifications
                  </p>
                  {notifications.length > 0 && unreadCount > 0 && (
  <button
    onClick={async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );

      setUnreadCount(0);
    }}
    className="text-xs text-indigo-600 hover:underline"
  >
    Mark all as read
  </button>
)}
<button
  onClick={clearReadNotifications}
  className="text-xs text-slate-500 hover:underline"
>
  Clear read
</button>
                  {notifications.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No notifications yet.
                    </p>
                  )}
                  

                  {notifications.map((n) => (
                    <div
  key={n.id}
  onClick={() => {
    if (!n.read) markAsRead(n.id);
  }}
  className={`p-3 rounded-lg text-sm cursor-pointer transition ${
    n.read
      ? "bg-slate-50"
      : "bg-indigo-50 hover:bg-indigo-100"
  }`}
>
                      <p className="font-medium text-slate-800">
                        {n.title}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 👤 Profile */}
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
                  size={36}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">
                      {userProfile?.first_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {userProfile?.email}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      router.push("/student/profile")
                    }
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition"
                  >
                    Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Canvas */}
        <div className="flex-1 w-full bg-slate-100">
          <div className="px-6 md:px-8 max-w-6xl mx-auto pb-12 pt-8">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="w-full border-t border-slate-200 bg-white">
          <div className="px-6 md:px-8 max-w-6xl mx-auto">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}