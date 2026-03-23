import Card from "../ui/Card";
import { CheckCircle } from "lucide-react";

interface Task {
  id: string;
  status: string;
  team_id: string;
}

interface Team {
  id: string;
  name: string;
}

interface Props {
  tasks: Task[];
  teams: Team[];
  completionRate: number;
}

export default function TaskProgress({ tasks, teams, completionRate }: Props) {
  const teamStats = teams.map((team) => {
    const teamTasks = tasks.filter((t) => t.team_id === team.id);
    const total = teamTasks.length;
    const completed = teamTasks.filter((t) => t.status === "completed").length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { team, total, completed, rate };
  });

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gray-900 text-white">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
              Progress
            </p>
            <h2 className="font-semibold text-gray-900 dark:text-white leading-none">Task Completion</h2>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums leading-none">{completionRate}%</p>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-zinc-500 mt-0.5">Overall</p>
        </div>
      </div>

      {teamStats.length === 0 && (
        <p className="text-gray-400 text-sm py-4 text-center">No teams yet.</p>
      )}

      <div className="space-y-4">
        {teamStats.map(({ team, total, completed, rate }) => (
          <div key={team.id}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-medium text-gray-800 dark:text-zinc-300 truncate">{team.name}</p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 tabular-nums shrink-0 ml-2">
                {completed}/{total}
              </p>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 dark:bg-white rounded-full transition-all duration-500"
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
