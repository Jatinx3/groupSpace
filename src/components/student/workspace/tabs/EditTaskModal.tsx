"use client";

import { useTransition } from "react";
import { deleteTask, updateTask } from "../../../../app/student/teams/actions";

interface Props {
  task: any;
  teamId: string;
  onClose: () => void;
}

export default function EditTaskModal({
  task,
  teamId,
  onClose,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("taskId", task.id);
      formData.append("teamId", teamId);
      await deleteTask(formData);
      onClose(); // 🔥 close modal after delete
    });
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
            Edit Task
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Update task details
          </p>
        </div>

        <form action={updateTask} className="space-y-6">
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="teamId" value={teamId} />

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              name="title"
              defaultValue={task.title}
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
              defaultValue={task.description ?? ""}
              rows={3}
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
                defaultValue={task.status}
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
                defaultValue={task.priority}
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
                defaultValue={task.due_date?.split("T")[0]}
                className="w-full bg-gray-50 rounded-xl px-3 py-2 text-sm border border-gray-200 focus:bg-white focus:border-black"
              />
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100">

            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="text-sm text-red-500 hover:text-red-600 transition"
            >
              Delete Task
            </button>

            <div className="flex gap-3">
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
                Save Changes
              </button>
            </div>

          </div>

        </form>
      </div>
    </div>
  );
}