"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfessorTabs() {
  const pathname = usePathname();

  const tabs = [
    { label: "Overview", href: "/professor" },
    { label: "Thesis Collab", href: "/professor/thesis" },
  ];

  return (
    <nav className="border-t border-slate-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 flex gap-4">
        {tabs.map((tab) => {
          const active =
            pathname === tab.href ||
            pathname.startsWith(tab.href + "/");

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`py-2 border-b-2 text-sm font-medium transition-colors ${
                active
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

