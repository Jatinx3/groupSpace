"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTeam, joinTeamByCode } from "../../../app/student/teams/actions";

interface Props {
  onClose: () => void;
  courses: any[];
}

export default function CreateJoinTeamModal({
  onClose,
  courses,
}: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"create" | "join">("create");
  const [isPending, startTransition] = useTransition();

  const handleCreate = (formData: FormData) => {
    startTransition(async () => {
      await createTeam(formData);
      router.refresh();
      onClose();
    });
  };

  const handleJoin = (formData: FormData) => {
    startTransition(async () => {
      await joinTeamByCode(formData);
      router.refresh();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-white dark:bg-[#111111] dark:border dark:border-white/10 w-full max-w-md rounded-3xl shadow-xl p-8 relative">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition"
        >
          ✕
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {mode === "create" ? "Create a Team" : "Join a Team"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            {mode === "create"
              ? "Start collaborating with your group"
              : "Enter a team invite code to join"}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-100 dark:bg-[#1A1A1A] rounded-full p-1 mb-6 text-sm">
          <button
            type="button"
            onClick={() => setMode("create")}
            className={`flex-1 py-2 rounded-full transition ${
              mode === "create"
                ? "bg-white dark:bg-[#2A2A2A] shadow-sm font-medium text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300"
            }`}
          >
            Create
          </button>

          <button
            type="button"
            onClick={() => setMode("join")}
            className={`flex-1 py-2 rounded-full transition ${
              mode === "join"
                ? "bg-white dark:bg-[#2A2A2A] shadow-sm font-medium text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300"
            }`}
          >
            Join
          </button>
        </div>

        {/* CREATE */}
        {mode === "create" ? (
          <form action={handleCreate} className="space-y-4">

            <input
              name="name"
              placeholder="Team name"
              required
              className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-transparent dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 transition"
            />

            <select
              name="courseId"
              required
              className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-transparent dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 text-gray-900 dark:text-white transition"
            >
              <option value="">Select course</option>
              {courses.map((course: any) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-black dark:bg-white text-white dark:text-gray-900 py-3 rounded-xl text-sm font-medium hover:opacity-90 dark:hover:bg-gray-200 transition disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Create Team"}
            </button>
          </form>
        ) : (
          /* JOIN */
          <form action={handleJoin} className="space-y-4">

            <input
              name="code"
              placeholder="Enter invite code"
              required
              className="w-full bg-gray-100 dark:bg-[#1A1A1A] border border-transparent dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 transition"
            />

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-black dark:bg-white text-white dark:text-gray-900 py-3 rounded-xl text-sm font-medium hover:opacity-90 dark:hover:bg-gray-200 transition disabled:opacity-50"
            >
              {isPending ? "Joining..." : "Join Team"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}