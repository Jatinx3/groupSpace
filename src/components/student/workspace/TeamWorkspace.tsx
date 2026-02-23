"use client";

import { useState } from "react";
import {
  Users,
  CheckSquare,
  Activity,
  Folder,
  MessageSquare,
} from "lucide-react";

import TeamTab from "./tabs/TeamTab";
import ProgressTab from "./tabs/ProgressTab";
import StructureTab from "./tabs/StructureTab";
import ChatTab from "./tabs/ChatTab";
import TasksTab from "./tabs/TasksTab";
import FilesTab from "./tabs/FilesTab";
import type { Task } from "../../../types/task";
import type { Member } from "../../../types/member";

/* ============================= */
/* Types */
/* ============================= */





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

type FileItem = {
  id: string;
  file_name: string;
  file_size: number | null;
  created_at: string;
  uploaded_by: {
    first_name: string;
    last_name: string;
  } | null;
};

/* ============================= */
/* Props */
/* ============================= */

interface Props {
  teamId: string;
  teamName: string;
  courseName?: string;
  members: Member[];
  tasks: Task[];
  files: FileItem[];
  isLeader: boolean;
  messages: Message[];
  currentUserId: string;
  onDelete?: () => void;
}

/* ============================= */
/* Component */
/* ============================= */

export default function TeamWorkspace({
  teamId,
  teamName,
  courseName,
  members,
  tasks,
  files,
  isLeader,
  messages,
  currentUserId,
  onDelete,
}: Props) {
  const [activeTab, setActiveTab] = useState("team");

  const tabs = [
    { key: "team", label: "Team", icon: Users },
    { key: "tasks", label: "Tasks", icon: CheckSquare },
    { key: "progress", label: "Progress", icon: Activity },
    { key: "structure", label: "Structure", icon: Folder },
    { key: "chat", label: "Chat", icon: MessageSquare },
    { key: "files", label: "Files", icon: Folder }, // ✅ NEW TAB
  ];

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
        return <StructureTab />;

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
        {/* Tabs Navigation */}
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

        {/* Dynamic Content */}
        {renderTab()}
      </div>
    </div>
  );
}