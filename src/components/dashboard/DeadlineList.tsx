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
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
          <Clock className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800">
          Upcoming Deadlines
        </h2>
      </div>

      <div className="space-y-5">
        {upcoming.length === 0 && (
          <p className="text-slate-500 text-sm">
            No upcoming deadlines 🎉
          </p>
        )}

        {upcoming.map((task) => {
          const due = new Date(task.due_date!);
          const diffTime = due.getTime() - now.getTime();
          const daysLeft = Math.ceil(
            diffTime / (1000 * 60 * 60 * 24)
          );

          const urgency =
            daysLeft <= 3
              ? "border-rose-500"
              : daysLeft <= 7
              ? "border-amber-400"
              : "border-slate-200";

          const teamName =
            teams.find((t) => t.id === task.team_id)
              ?.name ?? "Team";

          return (
            <div
              key={task.id}
              className={`border-l-4 ${urgency} pl-5 py-3`}
            >
              <h3 className="font-semibold text-slate-800">
                {task.title}
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                {teamName}
              </p>

              <p className="text-sm mt-2 text-slate-600">
                Due in {daysLeft} day
                {daysLeft !== 1 && "s"}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}