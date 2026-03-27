"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Save, FileCode, Loader2 } from "lucide-react";
import {
  getFileContent,
  saveFileContent,
} from "../../../../app/student/teams/actions";

interface Props {
  fileId: string;
  fileName: string;
  onClose: () => void;
}

const EDITABLE_EXTENSIONS = ["txt", "md", "js", "ts"];

export function isEditable(fileName: string): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return EDITABLE_EXTENSIONS.includes(ext);
}

export default function FileEditor({ fileId, fileName, onClose }: Props) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCommitMsg, setShowCommitMsg] = useState(false);
  const [changeMessage, setChangeMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { content: text } = await getFileContent(fileId);
        setContent(text);
        setOriginalContent(text);
      } catch (err: any) {
        setError(err.message || "Failed to load file");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fileId]);

  const hasChanges = content !== originalContent;

  async function handleSave() {
    if (!hasChanges) return;

    if (!showCommitMsg) {
      setShowCommitMsg(true);
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("fileId", fileId);
      formData.append("content", content);
      formData.append("changeMessage", changeMessage || "Edited file");
      await saveFileContent(formData);
      router.refresh();
      onClose();
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save");
      setSaving(false);
    }
  }

  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#111111] dark:border dark:border-white/10 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
              <FileCode className="w-4 h-4 text-white dark:text-gray-900" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                {fileName}
              </h2>
              <p className="text-[11px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                {ext} • Editing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                Unsaved changes
              </span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor body */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full py-20">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full py-20">
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[400px] p-6 bg-white dark:bg-[#0A0A0A] text-sm text-gray-900 dark:text-zinc-200 font-mono leading-relaxed resize-none focus:outline-none"
              spellCheck={false}
            />
          )}
        </div>

        {/* Commit message (slides in) */}
        {showCommitMsg && (
          <div className="px-6 py-3 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#0D0D0D]">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">
              Change Message
            </label>
            <input
              value={changeMessage}
              onChange={(e) => setChangeMessage(e.target.value)}
              placeholder="Describe what changed..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              className="w-full text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 transition"
            />
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 dark:border-white/10 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-zinc-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-5 py-2 text-sm font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 transition flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {showCommitMsg ? "Save & Push" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
