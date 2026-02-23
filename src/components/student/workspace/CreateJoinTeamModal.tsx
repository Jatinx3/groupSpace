"use client";

import { useState } from "react";
import { createTeam, joinTeamByCode } from "../../..//app/student/teams/actions";

interface Props {
  onClose: () => void;
  courses: any[];
}

export default function CreateJoinTeamModal({
  onClose,
  courses,
}: Props) {
  const [mode, setMode] = useState<"create" | "join">("create");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-[500px] shadow-2xl relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-2">
          Create or Join a Team
        </h2>

        {/* Toggle */}
        <div className="flex bg-gray-100 rounded-full p-1 my-6">
          <button
            type="button"
            onClick={() => setMode("create")}
            className={`flex-1 py-2 rounded-full transition ${
              mode === "create" ? "bg-white shadow-sm" : ""
            }`}
          >
            Create Team
          </button>

          <button
            type="button"
            onClick={() => setMode("join")}
            className={`flex-1 py-2 rounded-full transition ${
              mode === "join" ? "bg-white shadow-sm" : ""
            }`}
          >
            Join Team
          </button>
        </div>

        {/* CREATE MODE */}
        {mode === "create" ? (
          <form action={createTeam} className="space-y-4">

            <input
              name="name"
              placeholder="Team Name"
              required
              className="w-full border rounded-lg px-4 py-2"
            />

            <select
              name="courseId"
              required
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="">Select Course</option>
              {courses.map((course: any) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 rounded-lg"
            >
              Create Team
            </button>
          </form>
        ) : (
          /* JOIN MODE */
          <form action={joinTeamByCode} className="space-y-4">

            <input
              name="code"
              placeholder="Enter Team Code"
              required
              className="w-full border rounded-lg px-4 py-2"
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 rounded-lg"
            >
              Join Team
            </button>
          </form>
        )}
      </div>
    </div>
  );
}