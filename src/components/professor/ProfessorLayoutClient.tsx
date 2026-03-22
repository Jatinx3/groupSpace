"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Menu,
  Bell,
  LogOut,
  User,
} from "lucide-react";
import { createClientSupabase } from "../../lib/supabase-client";
import { playChime } from "../../lib/chime";
import Avatar from "../ui/Avatar";
import Footer from "../layout/Footer";

interface ProfessorLayoutClientProps {
  children: React.ReactNode;
  firstName: string;
  email: string;
  avatarUrl: string | null;
}

const navItems = [
  { name: "Overview", href: "/professor", icon: LayoutDashboard },
  { name: "Courses", href: "/professor/courses", icon: BookOpen },
  { name: "Thesis Collab", href: "/professor/thesis", icon: GraduationCap },
];

export default function ProfessorLayoutClient({
  children,
  firstName,
  email,
  avatarUrl,
}: ProfessorLayoutClientProps) {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
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

      const { data: initial } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (initial) {
        setNotifications(initial);
        setUnreadCount(initial.filter((n: any) => !n.read).length);
      }

      channel = supabase
        .channel(`prof-notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((prev) => [payload.new as any, ...prev.slice(0, 4)]);
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
              prev.map((n) =>
                n.id === payload.new.id ? { ...n, ...(payload.new as any) } : n
              )
            );
            setUnreadCount((prev) =>
              payload.new.read && !payload.old.read ? Math.max(0, prev - 1) : prev
            );
          }
        )
        .subscribe();
    };

    setup();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearRead = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("notifications")
      .delete()
      .eq("user_id", user.id)
      .eq("read", true);
    setNotifications((prev) => prev.filter((n) => !n.read));
  };

  return (
    <div className="min-h-screen flex relative bg-white">
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-50 h-full
          bg-white border-r border-gray-100
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          ${isDesktopOpen ? "md:w-64" : "md:w-[72px]"}
          w-64 px-3 py-6
        `}
      >
        {/* Logo */}
        <div className="mb-8 px-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
              G
            </div>
            {isDesktopOpen && (
              <div>
                <h1 className="text-sm font-bold text-gray-900 tracking-tight leading-none">
                  GroupSpace
                </h1>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5 uppercase tracking-widest">
                  Professor
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/professor"
                ? pathname === "/professor"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3
                  px-3 py-2.5 rounded-xl
                  text-sm font-medium
                  transition-all duration-150
                  ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {isDesktopOpen && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <div className="px-6 md:px-8 py-4 flex items-center justify-between bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition"
            >
              <Menu className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setIsDesktopOpen(!isDesktopOpen)}
              className="hidden md:block p-2 rounded-xl hover:bg-gray-100 transition"
            >
              <Menu className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationOpen(!notificationOpen);
                  setProfileOpen(false);
                }}
                className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-gray-900 rounded-full" />
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-2 text-xs font-semibold bg-gray-900 text-white px-1.5 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-gray-500 hover:text-gray-900 transition"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={clearRead}
                        className="text-xs text-gray-400 hover:text-gray-700 transition"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-6">
                        No notifications yet.
                      </p>
                    )}
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => { if (!n.read) markAsRead(n.id); }}
                        className={`px-4 py-3 cursor-pointer transition border-b border-gray-50 last:border-0 ${
                          n.read
                            ? "hover:bg-gray-50"
                            : "bg-gray-50 hover:bg-gray-100 border-l-2 border-l-gray-900"
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationOpen(false);
                }}
                className="focus:outline-none"
              >
                <Avatar name={firstName} avatarUrl={avatarUrl} size={34} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{firstName}</p>
                    <p className="text-xs text-gray-400 truncate">{email}</p>
                  </div>
                  <button
                    onClick={() => router.push("/professor/profile")}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition flex items-center gap-2 border-t border-gray-100"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content canvas */}
        <div className="flex-1 w-full bg-gray-50">
          <div className="px-6 md:px-8 max-w-6xl mx-auto pb-12 pt-8">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="w-full border-t border-gray-100 bg-white">
          <div className="px-6 md:px-8 max-w-6xl mx-auto">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}
