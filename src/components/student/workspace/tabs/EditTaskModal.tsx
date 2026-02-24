"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleUpdate(formData: FormData) {
    startTransition(async () => {
      await updateTask(formData);
      router.refresh();
      onClose();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("taskId", task.id);
      formData.append("teamId", teamId);
      await deleteTask(formData);
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

        <h2 className="text-lg font-semibold mb-6">Edit Task</h2>

        <form action={handleUpdate} className="space-y-5">
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="teamId" value={teamId} />

          <input
            name="title"
            defaultValue={task.title}
            className="w-full bg-gray-50 rounded-xl px-4 py-2 text-sm border border-gray-200"
          />

          <textarea
            name="description"
            defaultValue={task.description ?? ""}
            rows={3}
            className="w-full bg-gray-50 rounded-xl px-4 py-2 text-sm border border-gray-200"
          />

          <div className="flex justify-between items-center pt-4 border-t">

            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Delete Task
              </button>
            ) : (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-red-500 font-medium">
                  Confirm delete?
                </span>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1 rounded bg-red-500 text-white text-xs"
                >
                  Yes
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 rounded border text-xs"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="flex gap-3">
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
                Save
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}