"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Users,
  GraduationCap,
  Bot,
} from "lucide-react";
import Logo from "../ui/Logo";

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
    { name: "AI Library", href: "/student/ai-library", icon: Bot },
  ];

  return (
    <aside
      className={`
        fixed md:relative z-50 h-full
        bg-white dark:bg-zinc-950 border-r border-gray-100 dark:border-white/5
        transition-all duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        ${isDesktopOpen ? "md:w-64" : "md:w-[72px]"}
        w-64
        px-3 py-6
      `}
    >
      {/* Logo */}
      <div className="mb-8 flex justify-center w-full">
        <Logo size="lg" showText={isDesktopOpen} align="center" />
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
                    ? "bg-gray-900 text-white dark:bg-white/10 dark:text-white dark:shadow-sm"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-white/5"
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
