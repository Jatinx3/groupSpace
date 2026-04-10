"use client";

import type { Member } from "../../../../types/member";
import Avatar from "../../../ui/Avatar";
import { Crown, Sparkles, User, BadgeAlert } from "lucide-react";

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
      <div className="grid md:grid-cols-2 gap-4">
        {[...members].sort((a, b) => {
          if (a.role === "LEADER" && b.role !== "LEADER") return -1;
          if (a.role !== "LEADER" && b.role === "LEADER") return 1;
          return a.first_name.localeCompare(b.first_name);
        }).map((member) => (
          <div
            key={member.id}
            className="group relative bg-white dark:bg-[#0f0f0f] border border-gray-100 dark:border-white/5 rounded-2xl p-5 hover:border-gray-200 dark:hover:border-white/10 hover:shadow-md transition-all duration-300 overflow-hidden flex items-center justify-between"
          >
            {/* Subtle animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50/50 to-transparent dark:via-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-[-100%] group-hover:translate-x-[100%]" />
            
            <div className="flex items-center gap-4 relative z-10 w-full">
              <div className="relative shrink-0">
                <Avatar 
                  name={`${member.first_name} ${member.last_name}`} 
                  avatarUrl={member.avatar_url} 
                  size={52} 
                />
                {member.role === "LEADER" && (
                  <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-900 border-[2.5px] border-white dark:border-[#0f0f0f] w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-sm">
                    <Crown className="w-3 h-3 fill-current" />
                  </div>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-zinc-200 transition-colors truncate">
                  {member.first_name} {member.last_name}
                </h3>
                
                <div className="flex items-center mt-1">
                  {member.role === "LEADER" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
                      <Sparkles className="w-3 h-3" />
                      Team Leader
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-500">
                      <User className="w-3 h-3" />
                      Member
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
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