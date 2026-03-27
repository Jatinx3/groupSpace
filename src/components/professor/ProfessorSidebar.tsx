"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GraduationCap } from "lucide-react";
import Logo from "../ui/Logo";

interface ProfessorSidebarProps {
  isDesktopOpen: boolean;
  isMobileOpen: boolean;
}

export default function ProfessorSidebar({
  isDesktopOpen,
  isMobileOpen,
}: ProfessorSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/professor", icon: LayoutDashboard },
    { name: "Thesis Collab", href: "/professor/thesis", icon: GraduationCap },
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
      <div className="mb-12 flex justify-center w-full">
        <Logo size="lg" showText={isDesktopOpen} align="center" />
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/professor"
              ? pathname === "/professor"
              : pathname === item.href || pathname.startsWith(item.href + "/");

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
  );
}
