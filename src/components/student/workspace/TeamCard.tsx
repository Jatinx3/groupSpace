"use client";

import Link from "next/link";

export default function TeamCard({ team }: any) {
  return (
    <Link href={`/student/teams/${team.id}`}>
      <div className="group bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/10 p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer">

        {/* Course Badge */}
        <div className="mb-3">
          <span className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-zinc-500">
            {team.courses?.name}
          </span>
        </div>

        {/* Team Name */}
        <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-gray-200 transition">
          {team.name}
        </h3>

        {/* Subtle Divider */}
        <div className="mt-4 h-px bg-gray-100 dark:bg-white/10" />

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400 dark:text-zinc-500">
          <span>Open Workspace</span>
          <span className="group-hover:translate-x-1 transition-transform">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}