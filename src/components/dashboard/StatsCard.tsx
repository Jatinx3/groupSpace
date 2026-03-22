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
    <div className="group relative bg-[#111111] border border-white/10 rounded-2xl p-5 hover:border-zinc-700 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Subtle top glare */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-300 group-hover:scale-105 group-hover:bg-white/10 group-hover:text-white transition-all duration-300">
          <Icon className="w-4 h-4" />
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-white/20 transition-colors duration-300" />
      </div>

      <div className="relative z-10 mt-auto">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-white tabular-nums tracking-tight leading-none">
            {value}
          </p>
        </div>
        {subtitle && (
          <p className="text-xs text-zinc-500 mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
