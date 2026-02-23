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
        <h2 className="text-2xl font-semibold">Progress</h2>
        <p className="text-gray-500 mt-1">
          Monitor project progress and milestones
        </p>
      </div>

      {/* Overall Progress Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
        <h3 className="font-semibold">Overall Progress</h3>

        <div className="flex justify-between text-sm text-gray-600">
          <span>{completed} of {total} tasks completed</span>
          <span>{percent}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-black h-2 transition-all"
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
      <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
        <h3 className="font-semibold">Activity Timeline</h3>

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
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </div>
  );
}

function TimelineItem({ task }: any) {
  const badgeStyles = {
    completed: "bg-black text-white",
    in_progress: "bg-gray-200 text-gray-800",
    pending: "bg-gray-100 text-gray-600",
    blocked: "bg-red-100 text-red-600",
  };

  return (
    <div className="relative pl-6 border-l border-gray-200">
      <div className="absolute -left-2 top-1 w-4 h-4 rounded-full bg-black" />

      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h4 className="font-semibold">{task.title}</h4>
          <p className="text-gray-500 text-sm">
            {task.description}
          </p>

          <p className="text-sm text-gray-400">
            Assigned to: {task.assignee} • {task.dueDate}
          </p>

          {/* Mini Progress for In Progress */}
          {task.status === "in_progress" && task.progress && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-black h-2"
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