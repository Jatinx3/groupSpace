"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  CheckSquare,
  Activity,
  FolderTree,
  MessageSquare,
  Folder,
} from "lucide-react";

import { addMemberByEmail } from "../../../app/student/teams/invite-actions";

import TeamTab from "./tabs/TeamTab";
import ProgressTab from "./tabs/ProgressTab";
import StructureTab from "./tabs/StructureTab";
import ChatTab from "./tabs/ChatTab";
import TasksTab from "./tabs/TasksTab";
import FilesTab from "./tabs/FilesTab";

import type { Task } from "../../../types/task";
import type { Member } from "../../../types/member";

type Message = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    id: string;
    full_name: string;
  } | null;
};

interface Props {
  teamId: string;
  teamName: string;
  courseName?: string;
  inviteCode: string;
  members: Member[];
  tasks: Task[];
  files: any[];
  folders: any[];
  isLeader: boolean;
  messages: Message[];
  currentUserId: string;
  onDelete?: () => void;
}

export default function TeamWorkspace({
  teamId,
  teamName,
  courseName,
  inviteCode,
  members,
  tasks,
  files,
  folders,
  isLeader,
  messages,
  currentUserId,
}: Props) {
  const [activeTab, setActiveTab] = useState("team");

  const tabs = [
    { key: "team", label: "Team", icon: Users },
    { key: "tasks", label: "Tasks", icon: CheckSquare },
    { key: "progress", label: "Progress", icon: Activity },
    { key: "structure", label: "Structure", icon: FolderTree },
    { key: "chat", label: "Chat", icon: MessageSquare },
    { key: "files", label: "Files", icon: Folder },
  ];

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!email) return;

    startTransition(async () => {
      await addMemberByEmail(teamId, email);
      setEmail("");
      router.refresh();
    });
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(inviteCode);
  };

  function renderTab() {
    switch (activeTab) {
      case "team":
        return (
          <TeamTab
            teamName={teamName}
            members={members}
            tasks={tasks}
          />
        );
      case "tasks":
        return (
          <TasksTab
            tasks={tasks}
            teamId={teamId}
            isLeader={isLeader}
            members={members}
          />
        );
      case "progress":
        return <ProgressTab tasks={tasks} />;
      case "structure":
        return (
          <StructureTab
            teamId={teamId}
            folders={folders}
            files={files}
            isLeader={isLeader}
          />
        );
      case "chat":
        return (
          <ChatTab
            teamId={teamId}
            initialMessages={messages}
            currentUserId={currentUserId}
          />
        );
      case "files":
        return (
          <FilesTab
            teamId={teamId}
            files={files}
            isLeader={isLeader}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="py-10">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {teamName}
            </h1>
            {courseName && (
              <p className="text-sm text-gray-500 mt-1">
                {courseName}
              </p>
            )}
          </div>

          {isLeader && (
            <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Code:</span>
                <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                  {inviteCode.slice(0, 8)}
                </span>
                <button
                  onClick={copyCode}
                  className="text-xs text-gray-600 hover:text-black"
                >
                  Copy
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Add by email"
                  className="bg-white border rounded-lg px-3 py-1 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-black/10"
                />
                <button
                  onClick={handleAdd}
                  disabled={isPending}
                  className="bg-black text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50"
                >
                  {isPending ? "..." : "Add"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TABS */}
        <div className="flex gap-6 border-b border-gray-200 pb-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {renderTab()}
      </div>
    </div>
  );
}