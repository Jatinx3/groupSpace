"use client";

import type { Member } from "../../../../types/member";


type Task = {
  id: string;
  status: string;
};

interface Props {
  teamName: string;
  members: Member[];
  tasks: Task[];
}

export default function TeamTab({
  teamName,
  members,
  tasks,
}: Props) {

  const totalTasks = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const pending = tasks.filter(t => t.status === "pending").length;

  const completionRate =
    totalTasks === 0
      ? 0
      : Math.round((completed / totalTasks) * 100);

  const health =
    completionRate > 75
      ? "Excellent"
      : completionRate > 40
      ? "On Track"
      : "Needs Attention";

  const healthColor =
    completionRate > 75
      ? "text-green-600"
      : completionRate > 40
      ? "text-blue-600"
      : "text-red-600";

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Team Overview
        </h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1">
          Insights into your team's performance
        </p>
      </div>

      {/* Members */}
      <div className="grid md:grid-cols-2 gap-6">
        {members.map((member) => {
          const initials =
            member.first_name[0] + member.last_name[0];

          return (
            <div
              key={member.id}
              className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-gray-900 flex items-center justify-center font-semibold">
                  {initials}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {member.first_name} {member.last_name}
                    </h3>

                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        member.role === "LEADER"
                          ? "bg-black dark:bg-white text-white dark:text-gray-900"
                          : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-zinc-300"
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
                    {member.email}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Task Distribution */}
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <h2 className="font-medium text-gray-900 dark:text-white mb-4">
            Task Distribution
          </h2>

          <div className="space-y-2 text-sm text-gray-700 dark:text-zinc-300">
            <div className="flex justify-between">
              <span>Pending</span>
              <span>{pending}</span>
            </div>
            <div className="flex justify-between">
              <span>In Progress</span>
              <span>{inProgress}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed</span>
              <span>{completed}</span>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <h2 className="font-medium text-gray-900 dark:text-white mb-4">
            Completion
          </h2>

          <div className="text-3xl font-semibold text-gray-900 dark:text-white">
            {completionRate}%
          </div>

          <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 mt-4">
            <div
              className="bg-black dark:bg-white h-2 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Team Health */}
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <h2 className="font-medium text-gray-900 dark:text-white mb-4">
            Team Health
          </h2>

          <div className={`text-2xl font-semibold ${healthColor}`}>
            {health}
          </div>

          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
            Based on task completion rate.
          </p>
        </div>

      </div>
    </div>
  );
}