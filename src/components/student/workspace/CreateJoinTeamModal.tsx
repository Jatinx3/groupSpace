"use client";

import { useState } from "react";
import { createTeam } from "@/src/app/student/teams/actions";
export default function CreateJoinTeamModal({ onClose }: any) {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  async function handleCreate() {
    await createTeam(name, "course-id-here");
    onClose();
  }

  async function handleJoin() {
    await joinTeamByCode(code);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-[500px] shadow-2xl relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-2">
          Create or Join a Team
        </h2>

        <div className="flex bg-gray-100 rounded-full p-1 my-6">
          <button
            onClick={() => setMode("create")}
            className={`flex-1 py-2 rounded-full ${
              mode === "create" ? "bg-white shadow-sm" : ""
            }`}
          >
            Create Team
          </button>

          <button
            onClick={() => setMode("join")}
            className={`flex-1 py-2 rounded-full ${
              mode === "join" ? "bg-white shadow-sm" : ""
            }`}
          >
            Join Team
          </button>
        </div>

        {mode === "create" ? (
          <>
            <input
              placeholder="Team Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
            />

            <button
              onClick={handleCreate}
              className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 rounded-lg"
            >
              Create Team
            </button>
          </>
        ) : (
          <>
            <input
              placeholder="Enter 6-digit team code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
            />

            <button
              onClick={handleJoin}
              className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 rounded-lg"
            >
              Join Team
            </button>
          </>
        )}
      </div>
    </div>
  );
}