"use client";

import { useState } from "react";
import { createTask } from "../../../../app/student/teams/actions";

import type { Member } from "../../../../types/member";

interface Props {
  teamId: string;
  members: Member[];
  onClose: () => void;
}

export default function AddTaskModal({
  teamId,
  members,
  onClose,
}: Props) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  function toggleMember(id: string) {
    setSelectedMembers((prev) =>
      prev.includes(id)
        ? prev.filter((m) => m !== id)
        : [...prev, id]
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-black"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Create Task
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Define details and assign team members
          </p>
        </div>

        <form action={createTask} className="space-y-6">
          <input type="hidden" name="teamId" value={teamId} />

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              name="title"
              required
              placeholder="Design landing page"
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-200 focus:bg-white focus:border-black focus:outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Optional details about the task"
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border border-gray-200 focus:bg-white focus:border-black focus:outline-none transition"
            />
          </div>

          {/* Row: Status + Priority + Due */}
          <div className="grid grid-cols-3 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                defaultValue="pending"
                className="w-full bg-gray-50 rounded-xl px-3 py-2 text-sm border border-gray-200 focus:bg-white focus:border-black"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                defaultValue="medium"
                className="w-full bg-gray-50 rounded-xl px-3 py-2 text-sm border border-gray-200 focus:bg-white focus:border-black"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                required
                className="w-full bg-gray-50 rounded-xl px-3 py-2 text-sm border border-gray-200 focus:bg-white focus:border-black"
              />
            </div>

          </div>

          {/* Assignees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Assign Members
            </label>

            <div className="flex flex-wrap gap-2">
              {members.map((member) => {
                const active = selectedMembers.includes(member.id);

                return (
                  <button
                    type="button"
                    key={member.id}
                    onClick={() => toggleMember(member.id)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition ${
                      active
                        ? "bg-black text-white border-black"
                        : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {member.first_name} {member.last_name}
                  </button>
                );
              })}
            </div>

            <input
              type="hidden"
              name="assignees"
              value={JSON.stringify(selectedMembers)}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-sm rounded-xl bg-black text-white hover:opacity-90 transition"
            >
              Create Task
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}