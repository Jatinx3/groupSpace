"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
};

interface Props {
  tasks: Task[];
  teamId: string;
  isLeader: boolean;
}

export default function TasksTab({ tasks, teamId, isLeader }: Props) {
  const [openAdd, setOpenAdd] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const pending = tasks.filter((t) => t.status === "pending").length;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <p className="text-gray-500 mt-1">
            Create, update, and track all project tasks
          </p>
        </div>

        {isLeader && (
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg"
          >
            <Plus size={16} />
            Add Task
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard label="Total Tasks" value={total} />
        <StatCard label="Completed" value={completed} color="text-green-600" />
        <StatCard label="In Progress" value={inProgress} color="text-blue-600" />
        <StatCard label="Pending" value={pending} color="text-gray-600" />
      </div>

      {/* Task List */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 mb-4">All Tasks</h2>

        {tasks.length === 0 && (
          <p className="text-gray-500 text-sm">No tasks yet.</p>
        )}

        {tasks.map((task) => (
          <div
            key={task.id}
            className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">
                    {task.title}
                  </h3>
                  <StatusBadge status={task.status} />
                </div>

                {task.description && (
                  <p className="text-sm text-gray-500">
                    {task.description}
                  </p>
                )}

                <div className="flex gap-4 text-xs text-gray-500 mt-2">
                  {task.due_date && (
                    <span>
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>

              {isLeader && (
                <button
                  onClick={() => setEditTask(task)}
                  className="text-sm text-gray-500 hover:text-black"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {openAdd && (
        <AddTaskModal
          teamId={teamId}
          onClose={() => setOpenAdd(false)}
        />
      )}

      {editTask && (
        <EditTaskModal
          task={editTask}
          teamId={teamId}
          onClose={() => setEditTask(null)}
        />
      )}
    </div>
  );
}

/* ---------- UI Helpers ---------- */

function StatCard({
  label,
  value,
  color = "text-black",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "completed"
      ? "bg-green-100 text-green-700"
      : status === "in_progress"
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-600";

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${styles}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles =
    priority === "high"
      ? "text-red-600"
      : priority === "medium"
      ? "text-yellow-600"
      : "text-green-600";

  return (
    <span className={styles}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}