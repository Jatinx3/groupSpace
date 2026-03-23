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
    <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden transition-colors">
      <div className="hidden dark:block absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="p-2.5 rounded-xl bg-gray-900 dark:bg-white/5 border border-transparent dark:border-white/5 text-white dark:text-zinc-300">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
            Upcoming
          </p>
          <h2 className="font-semibold text-gray-900 dark:text-zinc-100 leading-none mt-1">
            Deadlines
          </h2>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        {upcoming.length === 0 && (
          <p className="text-gray-400 dark:text-zinc-500 text-sm py-8 text-center border border-dashed border-gray-200 dark:border-white/5 rounded-xl transition-colors">
            No upcoming deadlines. You&apos;re all caught up!
          </p>
        )}

        {upcoming.map((task) => {
          const due = new Date(task.due_date!);
          const diffTime = due.getTime() - now.getTime();
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          const urgencyClass =
            daysLeft <= 3
              ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400"
              : daysLeft <= 7
              ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400"
              : "bg-gray-50 text-gray-500 border-gray-100 dark:bg-white/5 dark:border-white/5 dark:text-zinc-400";

          const teamName =
            teams.find((t) => t.id === task.team_id)?.name ?? "Team";

          return (
            <div
              key={task.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 hover:border-gray-300 dark:hover:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 cursor-default shadow-sm hover:shadow-md dark:shadow-none"
            >
              <div className="min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-zinc-200 text-sm truncate group-hover:text-black dark:group-hover:text-white transition-colors">
                  {task.title}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-zinc-700" />
                  <p className="text-[11px] text-gray-500 dark:text-zinc-500">{teamName}</p>
                </div>
              </div>
              <span className={`shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-md border ${urgencyClass} transition-colors`}>
                {daysLeft}d left
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
