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
        <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
          <Clock className="w-4 h-4" />
        </div>
        <h2 className="font-semibold text-gray-900">
          Upcoming Deadlines
        </h2>
      </div>

      <div className="space-y-4">
        {upcoming.length === 0 && (
          <p className="text-gray-500 text-sm">
            No upcoming deadlines.
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
              ? "border-black"
              : daysLeft <= 7
              ? "border-gray-500"
              : "border-gray-200";

          const teamName =
            teams.find((t) => t.id === task.team_id)
              ?.name ?? "Team";

          return (
            <div
              key={task.id}
              className={`border-l-2 ${urgency} pl-4 py-2`}
            >
              <h3 className="font-medium text-gray-900 text-sm">
                {task.title}
              </h3>

              <p className="text-xs text-gray-500 mt-0.5">
                {teamName}
              </p>

              <p className="text-xs mt-1 text-gray-400">
                Due in {daysLeft} day{daysLeft !== 1 && "s"}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}