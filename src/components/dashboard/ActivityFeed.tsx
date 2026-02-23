import Card from "../ui/Card";
import { Activity } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  created_at: string | null;
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

export default function ActivityFeed({ tasks, teams }: Props) {
  const now = new Date();

  const taskActivity = tasks
    .map((task) => {
      if (!task.created_at) return null;

      const createdTime = new Date(task.created_at);
      if (isNaN(createdTime.getTime())) return null;

      const diffMs = now.getTime() - createdTime.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      let timeLabel = "";

      if (diffHours < 1) timeLabel = "Just now";
      else if (diffHours < 24) timeLabel = `${diffHours}h ago`;
      else if (diffDays === 1) timeLabel = "Yesterday";
      else timeLabel = `${diffDays} days ago`;

      const teamName =
        teams.find((t) => t.id === task.team_id)?.name ?? "Team";

      const text =
        task.status === "completed"
          ? `Task completed: ${task.title}`
          : `New task added in ${teamName}`;

      return {
        id: task.id,
        text,
        time: timeLabel,
        created_at: createdTime.getTime(),
      };
    })
    .filter(Boolean) as {
    id: string;
    text: string;
    time: string;
    created_at: number;
  }[];

  const recent = taskActivity
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, 5);

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-xl bg-sky-100 text-sky-600">
          <Activity className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800">
          Recent Activity
        </h2>
      </div>

      <div className="space-y-6">
        {recent.length === 0 && (
          <p className="text-slate-500 text-sm">
            No recent activity yet.
          </p>
        )}

        {recent.map((item) => (
          <div key={item.id}>
            <p className="text-slate-700">
              {item.text}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {item.time}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}