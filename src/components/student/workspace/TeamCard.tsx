"use client";

import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";

export default function TeamCard({ team }: any) {
  return (
    <Link href={`/student/teams/${team.id}`} className="block">
      <div className="group bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5 p-4 shadow-sm transition-all duration-300 hover:border-gray-200 dark:hover:border-white/10 hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex items-center gap-4">
        
        {/* Semantic Icon */}
        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100/50 dark:border-white/5 flex shrink-0 items-center justify-center text-gray-500 dark:text-zinc-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
          <Users className="w-5 h-5" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-0.5 truncate">
            {team.courses?.name || "Workspace"}
          </p>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors truncate">
            {team.name}
          </h3>
        </div>

        {/* Link Arrow */}
        <div className="text-gray-300 dark:text-zinc-600 group-hover:text-gray-900 dark:group-hover:text-white transition-all duration-300 group-hover:translate-x-1 shrink-0 p-1">
          <ArrowRight className="w-4 h-4" />
        </div>

      </div>
    </Link>
  );
}