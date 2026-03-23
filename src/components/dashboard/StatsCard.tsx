import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
  subtitle?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  subtitle,
}: StatsCardProps) {
  return (
    <div className="group relative bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/10 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-md dark:hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Subtle top glare (Dark Mode Only) */}
      <div className="hidden dark:block absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/5 text-gray-500 dark:text-zinc-300 group-hover:scale-105 group-hover:bg-gray-900 group-hover:text-white dark:group-hover:bg-white/10 dark:group-hover:text-white transition-all duration-300">
          <Icon className="w-4 h-4" />
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-zinc-800 group-hover:bg-gray-900 dark:group-hover:bg-white/20 transition-colors duration-300" />
      </div>

      <div className="relative z-10 mt-auto">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-1 transition-colors">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tight leading-none transition-colors">
            {value}
          </p>
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-zinc-500 mt-2 transition-colors">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
