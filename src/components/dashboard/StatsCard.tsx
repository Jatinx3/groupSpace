import Card from "../ui/Card";
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
    <Card className="group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-gray-900 text-white group-hover:scale-105 transition-transform duration-200">
          <Icon className="w-4 h-4" />
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-gray-900 transition-colors duration-300" />
      </div>
      <p className="text-3xl font-extrabold text-gray-900 tabular-nums tracking-tight leading-none">
        {value}
      </p>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-2">
        {title}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      )}
    </Card>
  );
}
