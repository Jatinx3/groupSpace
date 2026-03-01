import Link from "next/link";
import Card from "../ui/Card";
import { GraduationCap, Clock } from "lucide-react";

interface Thesis {
  id: string;
  title: string;
  studentName: string;
  status: string;
  deadline: string | null;
  progress: number;
}

interface Props {
  theses: Thesis[];
}

export default function ProfThesisList({ theses }: Props) {
  const now = new Date();

  const sorted = [...theses]
    .filter((t) => t.status !== "completed")
    .sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    })
    .slice(0, 5);

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
          <GraduationCap className="w-4 h-4" />
        </div>
        <h2 className="font-semibold text-gray-900">Active Theses</h2>
      </div>

      <div className="space-y-5">
        {sorted.length === 0 && (
          <p className="text-gray-500 text-sm">No active theses.</p>
        )}

        {sorted.map((thesis) => {
          const daysLeft = thesis.deadline
            ? Math.ceil(
                (new Date(thesis.deadline).getTime() - now.getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : null;

          const urgency =
            daysLeft !== null && daysLeft <= 7
              ? "border-black"
              : daysLeft !== null && daysLeft <= 30
              ? "border-gray-500"
              : "border-gray-200";

          return (
            <Link
              key={thesis.id}
              href={`/professor/thesis/${thesis.id}`}
              className={`block border-l-2 ${urgency} pl-4 py-1 group`}
            >
              <h3 className="font-medium text-gray-900 text-sm group-hover:text-indigo-600 transition-colors truncate">
                {thesis.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{thesis.studentName}</p>

              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-1">
                  <div
                    className="bg-indigo-500 h-1 rounded-full transition-all"
                    style={{ width: `${thesis.progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 tabular-nums">
                  {thesis.progress}%
                </span>
              </div>

              {daysLeft !== null && (
                <p className="text-xs mt-1.5 text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 shrink-0" />
                  {daysLeft > 0 ? `${daysLeft}d remaining` : "Overdue"}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      {theses.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <Link
            href="/professor/thesis"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            View all →
          </Link>
        </div>
      )}
    </Card>
  );
}
