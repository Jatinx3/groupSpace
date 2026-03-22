"use client";

import { useTransition, useState } from "react";
import { deleteTask, updateTask } from "../../../../app/student/teams/actions";
import type { Member } from "../../../../types/member";

interface Props {
  task: any;
  teamId: string;
  members: Member[];
  onClose: () => void;
  onSuccess?: () => void;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-600" },
  { value: "in_progress", label: "In Progress", color: "bg-gray-800 text-white" },
  { value: "completed", label: "Completed", color: "bg-gray-900 text-white" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function EditTaskModal({
  task,
  teamId,
  members,
  onClose,
  onSuccess,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(task.status ?? "pending");
  const [selectedPriority, setSelectedPriority] = useState<string>(task.priority ?? "medium");
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    task.assignees?.map((a: any) => a.id) ?? []
  );

  function toggleMember(id: string) {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  function handleUpdate(formData: FormData) {
    formData.set("status", selectedStatus);
    formData.set("assignees", JSON.stringify(selectedMembers));
    startTransition(async () => {
      await updateTask(formData);
      onSuccess?.();
      onClose();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("taskId", task.id);
      formData.append("teamId", teamId);
      await deleteTask(formData);
      onSuccess?.();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Editing</p>
            <h2 className="text-base font-bold text-gray-900 mt-0.5">Edit Task</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition text-sm"
          >
            ✕
          </button>
        </div>

        <form action={handleUpdate} className="p-6 space-y-5">
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="teamId" value={teamId} />

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
              Title
            </label>
            <input
              name="title"
              defaultValue={task.title}
              className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm border border-gray-200 focus:outline-none focus:border-gray-400 focus:bg-white transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={task.description ?? ""}
              rows={3}
              className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm border border-gray-200 focus:outline-none focus:border-gray-400 focus:bg-white transition resize-none"
            />
          </div>

          {/* Progress (Status) */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
              Progress
            </label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedStatus(opt.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                    selectedStatus === opt.value
                      ? opt.color + " border-transparent"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                Priority
              </label>
              <select
                name="priority"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm border border-gray-200 focus:outline-none focus:border-gray-400 focus:bg-white transition"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                defaultValue={task.due_date?.slice(0, 10) ?? ""}
                className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm border border-gray-200 focus:outline-none focus:border-gray-400 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Members */}
          {members.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Assigned Members
              </label>
              <div className="flex flex-wrap gap-2">
                {members.map((member) => {
                  const active = selectedMembers.includes(member.id);
                  return (
                    <button
                      type="button"
                      key={member.id}
                      onClick={() => toggleMember(member.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        active
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${active ? "bg-white/20" : "bg-gray-200"}`}>
                        {member.first_name[0]}
                      </span>
                      {member.first_name} {member.last_name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm text-red-400 hover:text-red-600 transition"
              >
                Delete task
              </button>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-red-500 font-medium text-xs">Sure?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 rounded-lg border border-gray-200 text-xs font-semibold transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-sm bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold disabled:opacity-50 transition"
              >
                {isPending ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
