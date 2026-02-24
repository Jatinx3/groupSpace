"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  function toggleMember(id: string) {
    setSelectedMembers((prev) =>
      prev.includes(id)
        ? prev.filter((m) => m !== id)
        : [...prev, id]
    );
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createTask(formData);
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-6">Create Task</h2>

        <form action={handleSubmit} className="space-y-5">
          <input type="hidden" name="teamId" value={teamId} />
          <input
            type="hidden"
            name="assignees"
            value={JSON.stringify(selectedMembers)}
          />

          <input
            name="title"
            required
            placeholder="Task title"
            className="w-full bg-gray-50 rounded-xl px-4 py-2 text-sm border border-gray-200"
          />

          <textarea
            name="description"
            rows={3}
            placeholder="Description"
            className="w-full bg-gray-50 rounded-xl px-4 py-2 text-sm border border-gray-200"
          />

          <div className="grid grid-cols-3 gap-3">
            <select
              name="status"
              defaultValue="pending"
              className="bg-gray-50 rounded-xl px-3 py-2 text-sm border border-gray-200"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              name="priority"
              defaultValue="medium"
              className="bg-gray-50 rounded-xl px-3 py-2 text-sm border border-gray-200"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <input
              type="date"
              name="due_date"
              required
              className="bg-gray-50 rounded-xl px-3 py-2 text-sm border border-gray-200"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {members.map((member) => {
              const active = selectedMembers.includes(member.id);
              return (
                <button
                  type="button"
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className={`px-3 py-1 rounded-full text-xs border ${
                    active
                      ? "bg-black text-white border-black"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  {member.first_name} {member.last_name}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm bg-black text-white rounded-xl"
            >
              {isPending ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}