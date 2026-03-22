import Card from "../ui/Card";
import { Clock } from "lucide-react";

interface Task {
  id: string;
  title: string;
  due_date: string | null;
  team_id: string;
}

interface Team {
  id: string;
  name: string;
}

interface Props {
  tasks: Task[];
  teams: Team[];
}

export default function DeadlineList({ tasks, teams }: Props) {
  const now = new Date();

  const upcoming = tasks
    .filter(
      (task) =>
        task.due_date &&
        new Date(task.due_date) >= now
    )
    .sort(
      (a, b) =>
        new Date(a.due_date!).getTime() -
        new Date(b.due_date!).getTime()
    )
    .slice(0, 5);

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-gray-900 text-white">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            Upcoming
          </p>
          <h2 className="font-semibold text-gray-900 leading-none">
            Deadlines
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        {upcoming.length === 0 && (
          <p className="text-gray-400 text-sm py-4 text-center">
            No upcoming deadlines.
          </p>
        )}

        {upcoming.map((task) => {
          const due = new Date(task.due_date!);
          const diffTime = due.getTime() - now.getTime();
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          const urgencyBg =
            daysLeft <= 3
              ? "bg-gray-900 text-white"
              : daysLeft <= 7
              ? "bg-gray-200 text-gray-700"
              : "bg-gray-100 text-gray-500";

          const teamName =
            teams.find((t) => t.id === task.team_id)?.name ?? "Team";

          return (
            <div
              key={task.id}
              className="flex items-center justify-between gap-4 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition"
            >
              <div className="min-w-0">
                <h3 className="font-medium text-gray-900 text-sm truncate">
                  {task.title}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{teamName}</p>
              </div>
              <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${urgencyBg}`}>
                {daysLeft}d left
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
