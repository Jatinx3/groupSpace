import Card from "../ui/Card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: "indigo" | "orange" | "emerald" | "rose";
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color,
}: StatsCardProps) {
  const colorStyles = {
    indigo: {
      iconBg: "bg-indigo-100",
      iconText: "text-indigo-600",
      valueText: "text-indigo-500",
    },
    orange: {
      iconBg: "bg-orange-100",
      iconText: "text-orange-600",
      valueText: "text-orange-500",
    },
    emerald: {
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-600",
      valueText: "text-emerald-500",
    },
    rose: {
      iconBg: "bg-rose-100",
      iconText: "text-rose-600",
      valueText: "text-rose-500",
    },
  };

  const styles = colorStyles[color];

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm">{title}</p>
          <p className={`text-4xl font-bold mt-2 ${styles.valueText}`}>
            {value}
          </p>
        </div>

        <div
          className={`p-3 rounded-2xl ${styles.iconBg} ${styles.iconText}`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}
