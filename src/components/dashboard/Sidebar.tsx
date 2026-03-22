"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Users,
  GraduationCap,
} from "lucide-react";

interface SidebarProps {
  isDesktopOpen: boolean;
  isMobileOpen: boolean;
}

export default function Sidebar({
  isDesktopOpen,
  isMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/student", icon: LayoutDashboard },
    { name: "Courses", href: "/student/courses", icon: BookOpen },
    { name: "Teams", href: "/student/teams", icon: Users },
    {
      name: "Thesis Collab",
      href: "/student/thesis",
      icon: GraduationCap,
    },
  ];

  return (
    <aside
      className={`
        fixed md:relative z-50 h-full
        bg-zinc-950 border-r border-white/5
        transition-all duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        ${isDesktopOpen ? "md:w-64" : "md:w-[72px]"}
        w-64
        px-3 py-6
      `}
    >
      {/* Logo */}
      <div className="mb-8 px-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-zinc-100 font-bold text-sm shrink-0">
            G
          </div>
          {isDesktopOpen && (
            <div>
              <h1 className="text-sm font-bold text-zinc-100 tracking-tight leading-none">
                GroupSpace
              </h1>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5 uppercase tracking-widest">
                Student
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/student"
              ? pathname === "/student"
              : pathname === item.href || pathname.startsWith(item.href + "/");

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
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
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
  );
}
