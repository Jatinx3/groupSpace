import Card from "../ui/Card";
import { CheckCircle2, Clock, FileText } from "lucide-react";

interface Thesis {
  status: string;
  progress: number;
}

interface Props {
  theses: Thesis[];
}

export default function ProfStatusCard({ theses }: Props) {
  const inProgress = theses.filter((t) => t.status === "in_progress").length;
  const completed = theses.filter((t) => t.status === "completed").length;
  const pending = theses.filter(
    (t) => t.status !== "in_progress" && t.status !== "completed"
  ).length;

  const avgProgress =
    theses.length > 0
      ? Math.round(
          theses.reduce((sum, t) => sum + t.progress, 0) / theses.length
        )
      : 0;

  const items = [
    {
      label: "In Progress",
      count: inProgress,
      icon: Clock,
      bg: "bg-indigo-50",
      color: "text-indigo-500",
    },
    {
      label: "Completed",
      count: completed,
      icon: CheckCircle2,
      bg: "bg-emerald-50",
      color: "text-emerald-500",
    },
    {
      label: "Pending",
      count: pending,
      icon: FileText,
      bg: "bg-amber-50",
      color: "text-amber-500",
    },
  ];

  return (
    <Card>
      <h2 className="font-semibold text-gray-900 mb-5">Thesis Status</h2>

      <div className="space-y-3">
        {items.map(({ label, count, icon: Icon, bg, color }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${bg}`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
              <span className="text-sm text-gray-600">{label}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{count}</span>
          </div>
        ))}
      </div>

      {theses.length > 0 && (
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Avg. milestone progress</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${avgProgress}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700 tabular-nums w-9 text-right">
              {avgProgress}%
            </span>
          </div>
        </div>
      )}

      {theses.length === 0 && (
        <p className="text-sm text-gray-400 mt-4">No thesis projects yet.</p>
      )}
    </Card>
  );
}
