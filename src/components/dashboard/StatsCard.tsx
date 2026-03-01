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
}: StatsCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">
            {value}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-gray-100 text-gray-600">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}
