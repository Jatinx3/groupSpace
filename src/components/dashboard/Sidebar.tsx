"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Users,
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
  ];

  return (
    <aside
      className={`
        fixed md:relative z-50
        h-full
        bg-white/80 backdrop-blur-md border-r border-slate-200
        transition-all duration-300
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        ${isDesktopOpen ? "md:w-64" : "md:w-20"}
        w-64
        p-6
      `}
    >
      <div className="mb-10">
        <h1
          className={`text-xl font-semibold text-slate-800 transition-all ${
            !isDesktopOpen && "md:opacity-0"
          }`}
        >
          GroupSpace
        </h1>
      </div>

      <nav className="space-y-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all
                ${
                  isActive
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-100"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {isDesktopOpen && (
                <span className="font-medium hidden md:inline">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
