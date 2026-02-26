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
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
          <Activity className="w-4 h-4" />
        </div>
        <h2 className="font-semibold text-gray-900">
          Recent Activity
        </h2>
      </div>

      <div className="space-y-4">
        {recent.length === 0 && (
          <p className="text-gray-500 text-sm">
            No recent activity yet.
          </p>
        )}

        {recent.map((item) => (
          <div key={item.id}>
            <p className="text-sm text-gray-700">
              {item.text}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {item.time}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}