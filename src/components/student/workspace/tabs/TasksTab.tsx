"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Plus } from "lucide-react";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";
import { createClientSupabase } from "../../../../lib/supabase-client";

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
  tasks: propTasks,
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
  const [tasks, setTasks] = useState<Task[]>(propTasks);

  const supabaseRef = useRef(createClientSupabase());
  const channelRef = useRef<ReturnType<typeof supabaseRef.current.channel> | null>(null);

  const fetchTasks = useCallback(async () => {
    const { data } = await supabaseRef.current
      .from("tasks")
      .select(`
        id, team_id, title, description, status, priority, due_date, created_at, last_updated_by,
        task_assignees (
          user:profiles (id, first_name, last_name, email)
        ),
        updater:profiles!tasks_last_updated_by_fkey (id, first_name, last_name)
      `)
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });

    if (data) {
      setTasks(
        data.map((t: any) => ({
          ...t,
          assignees: t.task_assignees?.map((a: any) => a.user).filter(Boolean) ?? [],
          updater: t.updater || null,
        }))
      );
    }
  }, [teamId]);

  useEffect(() => {
    if (channelRef.current) return;

    const supabase = supabaseRef.current;

    const channel = supabase
      .channel(`tasks-room:${teamId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `team_id=eq.${teamId}` },
        () => { fetchTasks(); }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "task_assignees" },
        () => { fetchTasks(); }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [teamId, fetchTasks]);

  useEffect(() => {
    setTasks(propTasks);
  }, [propTasks]);

  const safeTasks = tasks ?? [];

  const filteredTasks = useMemo(() => {
    if (filter === "all") return safeTasks;
    return safeTasks.filter((t) => t.status === filter);
  }, [safeTasks, filter]);

  const totalPages = Math.ceil(filteredTasks.length / TASKS_PER_PAGE);

  const paginatedTasks = filteredTasks.slice(
    (page - 1) * TASKS_PER_PAGE,
    page * TASKS_PER_PAGE
  );

  function changeFilter(value: typeof filter) {
    setFilter(value);
    setPage(1);
  }

  const totalTasks = safeTasks.length;
  const completed = safeTasks.filter((t) => t.status === "completed").length;
  const inProgress = safeTasks.filter((t) => t.status === "in_progress").length;
  const pending = safeTasks.filter((t) => t.status === "pending").length;

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">
            Manage and track project work
          </p>
        </div>

        <button
          onClick={() => setOpenAdd(true)}
          className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard label="Total" value={totalTasks} />
        <StatCard label="Completed" value={completed} color="text-green-600" />
        <StatCard label="In Progress" value={inProgress} color="text-blue-600" />
        <StatCard label="Pending" value={pending} color="text-gray-500 dark:text-zinc-500" />
      </div>

      {/* Minimal Filter */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 dark:bg-[#1A1A1A] p-1 rounded-full">
          {["all", "pending", "in_progress", "completed"].map((value) => (
            <button
              key={value}
              onClick={() => changeFilter(value as any)}
              className={`px-4 py-1.5 text-sm rounded-full transition ${
                filter === value
                  ? "bg-white dark:bg-[#2A2A2A] shadow-sm text-black dark:text-white"
                  : "text-gray-500 dark:text-zinc-500 hover:text-black dark:hover:text-white"
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
          <p className="text-gray-500 dark:text-zinc-500 text-sm col-span-full text-center">
            No tasks found.
          </p>
        )}

        {paginatedTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:shadow-md dark:hover:shadow-white/5 transition"
          >
            <div className="flex justify-between items-start gap-6">

              <div className="space-y-3 flex-1">

                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {task.title}
                  </h3>
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority ?? "low"} />
                </div>

                {task.description && (
                  <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                    {task.description}
                  </p>
                )}

                {task.assignees && task.assignees.length > 0 && (
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-xs text-gray-400 dark:text-zinc-500">Assigned to:</span>
                    {task.assignees.map((a) => (
                      <span
                        key={a.id}
                        className="text-xs bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-zinc-300 px-2 py-0.5 rounded-full"
                      >
                        {[a.first_name, a.last_name].filter(Boolean).join(" ") || (a as any).email || "Unknown"}
                      </span>
                    ))}
                  </div>
                )}

                {task.due_date && (
                  <p className="text-[11px] font-medium text-gray-400 dark:text-zinc-500">
                    Due {new Date(task.due_date).toLocaleDateString()}
                  </p>
                )}

                {task.updater && (
                  <p className="text-[10px] text-gray-400 dark:text-zinc-600 italic">
                    Last updated by {task.updater.first_name} {task.updater.last_name}
                  </p>
                )}
              </div>

              <button
                onClick={() => setEditTask(task)}
                className="text-xs font-semibold text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
              >
                Edit
              </button>
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
                      ? "bg-black dark:bg-white text-white dark:text-gray-900"
                      : "text-gray-500 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-[#1A1A1A]"
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
          onSuccess={() => fetchTasks()}
        />
      )}

      {editTask && (
        <EditTaskModal
          task={editTask}
          teamId={teamId}
          members={members}
          onClose={() => setEditTask(null)}
          onSuccess={() => fetchTasks()}
        />
      )}
    </div>
  );
}

/* ---------------- UI Helpers ---------------- */

function StatCard({
  label,
  value,
  color = "text-black dark:text-white",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/10 rounded-2xl p-6 text-center hover:border-gray-200 dark:hover:border-white/20 hover:shadow-sm dark:hover:shadow-none transition">
      <p className={`text-3xl font-extrabold tracking-tight tabular-nums leading-none ${color}`}>{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-500 mt-2">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "completed"
      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
      : status === "in_progress"
      ? "bg-gray-800 dark:bg-[#2A2A2A] text-white dark:text-gray-200"
      : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-zinc-300";

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${styles}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority?: string | null }) {
  const value = priority ?? "low";

  const styles =
    value === "high"
      ? "text-gray-900 dark:text-white font-bold"
      : value === "medium"
      ? "text-gray-600 dark:text-zinc-300 font-semibold"
      : "text-gray-400 dark:text-zinc-500";

  return (
    <span className={`text-xs ${styles}`}>
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </span>
  );
}
