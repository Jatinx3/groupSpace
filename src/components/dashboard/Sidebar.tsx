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
    { name: "Assignments", href: "/student/assignments", icon: ClipboardList },
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
        bg-white border-r border-slate-100
        transition-all duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        ${isDesktopOpen ? "md:w-64" : "md:w-20"}
        w-64
        px-4 py-8
      `}
    >
      {/* Logo */}
      <div className="mb-12 px-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-semibold shadow-sm">
            G
          </div>

          {isDesktopOpen && (
            <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
              GroupSpace
            </h1>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

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
              {/* Active Indicator */}
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
  );
}