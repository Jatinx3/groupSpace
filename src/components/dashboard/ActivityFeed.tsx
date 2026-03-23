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
      else timeLabel = `${diffDays}d ago`;

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
        isCompleted: task.status === "completed",
        created_at: createdTime.getTime(),
      };
    })
    .filter(Boolean) as {
    id: string;
    text: string;
    time: string;
    isCompleted: boolean;
    created_at: number;
  }[];

  const recent = taskActivity
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden transition-colors">
      <div className="hidden dark:block absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="p-2.5 rounded-xl bg-gray-900 dark:bg-white/5 border border-transparent dark:border-white/5 text-white dark:text-zinc-300">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
            Feed
          </p>
          <h2 className="font-semibold text-gray-900 dark:text-zinc-100 leading-none mt-1">
            Recent Activity
          </h2>
        </div>
      </div>

      <div className="relative z-10 flex-1">
        {recent.length === 0 && (
          <p className="text-gray-400 dark:text-zinc-500 text-sm py-8 text-center border border-dashed border-gray-200 dark:border-white/5 rounded-xl transition-colors">
            No recent activity yet.
          </p>
        )}

        <div className="space-y-[1px]">
          {recent.map((item, index) => (
            <div
              key={item.id}
              className="group flex flex-col bg-gray-50/50 dark:bg-white/5 px-4 py-3 border border-transparent hover:border-gray-200 dark:hover:border-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all cursor-default first:rounded-t-xl last:rounded-b-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-gray-700 dark:text-zinc-300 leading-snug group-hover:text-gray-900 dark:group-hover:text-zinc-100 transition-colors">
                  {item.text}
                </p>
                <div className="shrink-0 flex items-center pt-0.5">
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium whitespace-nowrap">
                    {item.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
