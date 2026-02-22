"use client";

import { createTask } from "../../../../app/student/teams/actions";

export default function AddTaskModal({ teamId, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        action={createTask}
        className="bg-white p-8 rounded-xl w-[500px] space-y-4"
      >
        <input type="hidden" name="teamId" value={teamId} />

        <h2 className="text-lg font-semibold">Add Task</h2>

        <input
          name="title"
          placeholder="Task Title"
          className="w-full border px-4 py-2 rounded-lg"
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          className="w-full border px-4 py-2 rounded-lg"
        />

        <select
          name="status"
          className="w-full border px-4 py-2 rounded-lg"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          name="priority"
          className="w-full border px-4 py-2 rounded-lg"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
          type="date"
          name="due_date"
          className="w-full border px-4 py-2 rounded-lg"
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}