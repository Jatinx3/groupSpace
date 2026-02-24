"use client";

import Link from "next/link";

export default function TeamCard({ team }: any) {
  return (
    <Link href={`/student/teams/${team.id}`}>
      <div className="group bg-white rounded-2xl border border-gray-200 p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer">

        {/* Course Badge */}
        <div className="mb-3">
          <span className="text-[11px] uppercase tracking-wide text-gray-400">
            {team.courses?.name}
          </span>
        </div>

        {/* Team Name */}
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-black transition">
          {team.name}
        </h3>

        {/* Subtle Divider */}
        <div className="mt-4 h-px bg-gray-100" />

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <span>Open Workspace</span>
          <span className="group-hover:translate-x-1 transition-transform">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}