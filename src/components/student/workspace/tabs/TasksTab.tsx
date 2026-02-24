"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";

import type { Task } from "../../../../types/task";
import type { Member } from "../../../../types/member";

interface Props {
  tasks: Task[];
  teamId: string;
  isLeader: boolean;
  members: Member[];
}

const TASKS_PER_PAGE = 8;

export default function TasksTab({
  tasks,
  teamId,
  isLeader,
  members,
}: Props) {
  const [openAdd, setOpenAdd] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<
    "all" | "pending" | "in_progress" | "completed"
  >("all");
  const [page, setPage] = useState(1);

  const safeTasks = tasks ?? [];

  /* ---------------- Filtering ---------------- */

  const filteredTasks = useMemo(() => {
    if (filter === "all") return safeTasks;
    return safeTasks.filter((t) => t.status === filter);
  }, [safeTasks, filter]);

  /* ---------------- Pagination ---------------- */

  const totalPages = Math.ceil(filteredTasks.length / TASKS_PER_PAGE);

  const paginatedTasks = filteredTasks.slice(
    (page - 1) * TASKS_PER_PAGE,
    page * TASKS_PER_PAGE
  );

  function changeFilter(value: typeof filter) {
    setFilter(value);
    setPage(1);
  }

  /* ---------------- Stats ---------------- */

  const totalTasks = safeTasks.length;
  const completed = safeTasks.filter((t) => t.status === "completed").length;
  const inProgress = safeTasks.filter((t) => t.status === "in_progress").length;
  const pending = safeTasks.filter((t) => t.status === "pending").length;

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <p className="text-gray-500 mt-1">
            Manage and track project work
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

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard label="Total" value={totalTasks} />
        <StatCard label="Completed" value={completed} color="text-green-600" />
        <StatCard label="In Progress" value={inProgress} color="text-blue-600" />
        <StatCard label="Pending" value={pending} color="text-gray-500" />
      </div>

      {/* Minimal Filter */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 p-1 rounded-full">
          {["all", "pending", "in_progress", "completed"].map((value) => (
            <button
              key={value}
              onClick={() => changeFilter(value as any)}
              className={`px-4 py-1.5 text-sm rounded-full transition ${
                filter === value
                  ? "bg-white shadow-sm text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {value.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Task Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {paginatedTasks.length === 0 && (
          <p className="text-gray-500 text-sm col-span-full text-center">
            No tasks found.
          </p>
        )}

        {paginatedTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start gap-6">

              <div className="space-y-3 flex-1">

                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-medium text-gray-900">
                    {task.title}
                  </h3>
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority ?? "low"} />
                </div>

                {task.description && (
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {task.description}
                  </p>
                )}

                {task.due_date && (
                  <p className="text-xs text-gray-400">
                    Due {new Date(task.due_date).toLocaleDateString()}
                  </p>
                )}
              </div>

              {isLeader && (
                <button
                  onClick={() => setEditTask(task)}
                  className="text-sm text-gray-400 hover:text-black"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Minimal Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-6">
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;

              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`w-9 h-9 text-sm rounded-full transition ${
                    page === pageNumber
                      ? "bg-black text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {openAdd && (
        <AddTaskModal
          teamId={teamId}
          members={members}
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

/* ---------------- UI Helpers ---------------- */

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
    <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
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

function PriorityBadge({ priority }: { priority?: string | null }) {
  const value = priority ?? "low";

  const styles =
    value === "high"
      ? "text-red-600"
      : value === "medium"
      ? "text-yellow-600"
      : "text-green-600";

  return (
    <span className={`text-xs ${styles}`}>
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </span>
  );
}