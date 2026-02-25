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
    <nav className="border-t border-black/5 bg-white">
      <div className="max-w-6xl mx-auto px-6 flex gap-6">
        {tabs.map((tab) => {
          const active =
            pathname === tab.href ||
            pathname.startsWith(tab.href + "/");

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`py-3 border-b-2 text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
                active
                  ? "border-black text-black"
                  : "border-transparent text-neutral-500 hover:text-black"
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

