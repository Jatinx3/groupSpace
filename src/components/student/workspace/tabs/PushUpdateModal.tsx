"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, GitCommitHorizontal, FileUp } from "lucide-react";
import { pushFileUpdate } from "../../../../app/student/teams/actions";

interface Props {
  teamId: string;
  existingFileId?: string;
  existingFileName?: string;
  folderId?: string | null;
  onClose: () => void;
}

export default function PushUpdateModal({
  teamId,
  existingFileId,
  existingFileName,
  folderId,
  onClose,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [changeMessage, setChangeMessage] = useState("");
  const [isPushing, setIsPushing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handlePush() {
    if (!file) return;

    setIsPushing(true);

    const formData = new FormData();
    formData.append("teamId", teamId);
    formData.append("file", file);
    formData.append("changeMessage", changeMessage || "Updated file");
    if (existingFileId) formData.append("existingFileId", existingFileId);
    if (folderId) formData.append("folderId", folderId);

    try {
      await pushFileUpdate(formData);
      router.refresh();
      onClose();
    } catch (err) {
      console.error("Push error:", err);
      setIsPushing(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#111111] dark:border dark:border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
              <GitCommitHorizontal className="w-4 h-4 text-white dark:text-gray-900" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Push Update
              </h2>
              {existingFileName && (
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Updating: {existingFileName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              dragOver
                ? "border-gray-900 dark:border-white bg-gray-50 dark:bg-white/5"
                : file
                ? "border-green-300 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5"
                : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFile(f);
              }}
            />

            {file ? (
              <div className="space-y-1">
                <FileUp className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  {formatFileSize(file.size)} • Click to change
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="w-6 h-6 text-gray-400 dark:text-zinc-500 mx-auto" />
                <p className="text-sm text-gray-600 dark:text-zinc-300">
                  Drop a file here or <span className="font-semibold underline underline-offset-2">browse</span>
                </p>
                <p className="text-xs text-gray-400 dark:text-zinc-500">
                  Max 20 MB
                </p>
              </div>
            )}
          </div>

          {/* Change message */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Change Message
            </label>
            <textarea
              value={changeMessage}
              onChange={(e) => setChangeMessage(e.target.value)}
              placeholder="Describe what changed..."
              rows={2}
              className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 resize-none transition"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-zinc-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handlePush}
            disabled={!file || isPushing}
            className="px-5 py-2.5 text-sm font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 transition flex items-center gap-2"
          >
            <GitCommitHorizontal className="w-3.5 h-3.5" />
            {isPushing ? "Pushing..." : "Push Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
