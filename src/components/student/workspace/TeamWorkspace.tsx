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

/* ============================= */
/* Types */
/* ============================= */

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
};

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
  members: Member[];
  tasks: Task[];
  isLeader: boolean;
  messages: Message[];          // ✅ NEW
  currentUserId: string;        // ✅ NEW
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
  isLeader,
  messages,            // ✅ NEW
  currentUserId,       // ✅ NEW
  onDelete,
}: Props) {
  const [activeTab, setActiveTab] = useState("team");

  const tabs = [
    { key: "team", label: "Team", icon: Users },
    { key: "tasks", label: "Tasks", icon: CheckSquare },
    { key: "progress", label: "Progress", icon: Activity },
    { key: "structure", label: "Structure", icon: Folder },
    { key: "chat", label: "Chat", icon: MessageSquare },
  ];

  function renderTab() {
    switch (activeTab) {
      case "team":
        return (
          <TeamTab
            teamName={teamName}
            courseName={courseName}
            members={members}
            isLeader={isLeader}
            onDelete={onDelete}
          />
        );

      case "tasks":
        return (
          <TasksTab
            tasks={tasks}
            teamId={teamId}
            isLeader={isLeader}
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
            initialMessages={messages}       // ✅ PASS INITIAL MESSAGES
            currentUserId={currentUserId}    // ✅ PASS USER ID
          />
        );

      default:
        return null;
    }
  }

  return (
    <div className="py-10">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Top Tabs */}
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

        {/* Dynamic Tab Content */}
        {renderTab()}
      </div>
    </div>
  );
}