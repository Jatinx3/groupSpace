"use client";

import { updateTask } from "../../../../app/student/teams/actions";

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
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        action={updateTask}
        className="bg-white p-8 rounded-xl w-[500px] space-y-4"
      >
        <input type="hidden" name="taskId" value={task.id} />
        <input type="hidden" name="teamId" value={teamId} />

        <h2 className="text-lg font-semibold">Edit Task</h2>

        <input
          name="title"
          defaultValue={task.title}
          className="w-full border px-4 py-2 rounded-lg"
          required
        />

        <textarea
          name="description"
          defaultValue={task.description}
          className="w-full border px-4 py-2 rounded-lg"
        />

        <select
          name="status"
          defaultValue={task.status}
          className="w-full border px-4 py-2 rounded-lg"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          name="priority"
          defaultValue={task.priority}
          className="w-full border px-4 py-2 rounded-lg"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
          type="date"
          name="due_date"
          defaultValue={task.due_date ?? ""}
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
            Update
          </button>
        </div>
      </form>
    </div>
  );
}