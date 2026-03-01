"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Menu,
  Bell,
  LogOut,
} from "lucide-react";
import { createClientSupabase } from "../../lib/supabase-client";
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
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientSupabase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex relative bg-white">
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-50 h-full
          bg-white border-r border-slate-100
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          ${isDesktopOpen ? "md:w-64" : "md:w-20"}
          w-64 px-4 py-8
        `}
      >
        {/* Logo */}
        <div className="mb-12 px-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-semibold shadow-sm shrink-0">
              G
            </div>
            {isDesktopOpen && (
              <div>
                <h1 className="text-base font-semibold text-slate-900 tracking-tight leading-none">
                  GroupSpace
                </h1>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-widest">
                  Professor
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-2">
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
                  relative flex items-center gap-3
                  px-3 py-2.5 rounded-lg
                  text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-600 rounded-r-full" />
                )}
                <Icon className="w-5 h-5 shrink-0" />
                {isDesktopOpen && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <div className="px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={() => setIsDesktopOpen(!isDesktopOpen)}
              className="hidden md:block p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative text-slate-500 hover:text-slate-900 transition">
              <Bell className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="focus:outline-none"
              >
                <Avatar name={firstName} avatarUrl={avatarUrl} size={36} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">{firstName}</p>
                    <p className="text-xs text-slate-500 truncate">{email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition flex items-center gap-2"
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
