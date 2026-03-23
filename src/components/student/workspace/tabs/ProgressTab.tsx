"use client";

import type { Task } from "../../../../types/task";

interface Props {
  tasks: Task[];
}

export default function ProgressTab({ tasks }: Props) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const pending = tasks.filter(t => t.status === "pending").length;
  const blocked = tasks.filter(t => t.status === "blocked").length;

  const percent =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Progress</h2>
        <p className="text-gray-500 dark:text-zinc-400 mt-1">
          Monitor project progress and milestones
        </p>
      </div>

      {/* Overall Progress Card */}
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl p-8 space-y-6">
        <h3 className="font-semibold text-gray-900 dark:text-white">Overall Progress</h3>

        <div className="flex justify-between text-sm text-gray-600 dark:text-zinc-400">
          <span>{completed} of {total} tasks completed</span>
          <span>{percent}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
          <div
            className="bg-black dark:bg-white h-2 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 text-center mt-6">
          <Stat number={completed} label="Completed" color="text-green-500" />
          <Stat number={inProgress} label="In Progress" color="text-blue-500" />
          <Stat number={pending} label="Pending" color="text-gray-500" />
          <Stat number={blocked} label="Blocked" color="text-red-500" />
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl p-8 space-y-6">
        <h3 className="font-semibold text-gray-900 dark:text-white">Activity Timeline</h3>

        <div className="space-y-8">
          {tasks.map(task => (
            <TimelineItem key={task.id} task={task} />
          ))}
        </div>
      </div>

    </div>
  );
}

function Stat({ number, label, color }: any) {
  return (
    <div>
      <p className={`text-2xl font-semibold ${color}`}>{number}</p>
      <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">{label}</p>
    </div>
  );
}

function TimelineItem({ task }: any) {
  return (
    <div className="relative pl-6 border-l border-gray-200 dark:border-white/10">
      <div className="absolute -left-2 top-1 w-4 h-4 rounded-full bg-black dark:bg-white" />

      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 dark:text-white">{task.title}</h4>
          <p className="text-gray-500 dark:text-zinc-400 text-sm">
            {task.description}
          </p>

          <p className="text-sm text-gray-400 dark:text-zinc-500">
            Assigned to: {task.assignees?.map((a:any) => a.first_name).join(', ') || task.assignee || 'Unassigned'} • {task.dueDate || task.due_date || 'No date'}
          </p>

          {/* Mini Progress for In Progress */}
          {task.status === "in_progress" && task.progress && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-black dark:bg-white h-2"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {task.progress}% complete
              </p>
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
}