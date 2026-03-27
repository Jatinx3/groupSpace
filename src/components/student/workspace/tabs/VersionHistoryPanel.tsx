"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Download,
  RotateCcw,
  GitCommitHorizontal,
  Clock,
  User,
  MessageSquare,
} from "lucide-react";
import { downloadFile } from "../../../../lib/download";
import {
  getFileVersions,
  restoreVersion,
} from "../../../../app/student/teams/actions";

interface Version {
  id: string;
  versionNumber: number;
  fileUrl: string;
  fileSize: number | null;
  changeMessage: string | null;
  createdAt: string;
  uploadedBy: string;
  uploaderName: string;
}

interface Props {
  fileId: string;
  fileName: string;
  onClose: () => void;
}

export default function VersionHistoryPanel({
  fileId,
  fileName,
  onClose,
}: Props) {
  const router = useRouter();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getFileVersions(fileId);
        setVersions(data);
      } catch (err) {
        console.error("Failed to load versions:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fileId]);

  async function handleRestore(versionId: string) {
    setRestoringId(versionId);
    try {
      const formData = new FormData();
      formData.append("fileId", fileId);
      formData.append("versionId", versionId);
      await restoreVersion(formData);
      router.refresh();
      onClose();
    } catch (err) {
      console.error("Restore error:", err);
      setRestoringId(null);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#111111] dark:border dark:border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
              <Clock className="w-4 h-4 text-white dark:text-gray-900" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Version History
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {fileName} • {versions.length} version{versions.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Version List */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400 dark:text-zinc-500">
                No versions found.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {versions.map((version, index) => {
                const isLatest = index === 0;

                return (
                  <div
                    key={version.id}
                    className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition ${
                      isLatest ? "bg-gray-50/50 dark:bg-white/[0.02]" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* Version dot + line */}
                        <div className="flex flex-col items-center pt-1 shrink-0">
                          <div
                            className={`w-3 h-3 rounded-full border-2 ${
                              isLatest
                                ? "border-gray-900 dark:border-white bg-gray-900 dark:bg-white"
                                : "border-gray-300 dark:border-zinc-600 bg-white dark:bg-[#111111]"
                            }`}
                          />
                          {index < versions.length - 1 && (
                            <div className="w-px h-8 bg-gray-200 dark:bg-white/10 mt-1" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              v{version.versionNumber}
                            </span>
                            {isLatest && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-1.5 py-0.5 rounded-full">
                                Latest
                              </span>
                            )}
                          </div>

                          {version.changeMessage && (
                            <div className="flex items-start gap-1.5 mt-1">
                              <MessageSquare className="w-3 h-3 text-gray-400 dark:text-zinc-500 mt-0.5 shrink-0" />
                              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                                {version.changeMessage}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-gray-400 dark:text-zinc-500" />
                              <span className="text-[11px] text-gray-500 dark:text-zinc-400">
                                {version.uploaderName}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-400 dark:text-zinc-500">
                              {getRelativeTime(version.createdAt)}
                            </span>
                            {version.fileSize && (
                              <span className="text-[11px] text-gray-400 dark:text-zinc-500">
                                {formatFileSize(version.fileSize)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        <button
                          onClick={async () => {
                            await downloadFile(
                              `/api/files/versions/${version.id}`,
                              `${fileName.split('.')[0]}_v${version.versionNumber}.${fileName.split('.').pop()}`
                            );
                          }}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition"
                          title="Download this version"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {!isLatest && (
                          <button
                            onClick={() => handleRestore(version.id)}
                            disabled={restoringId === version.id}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition disabled:opacity-40"
                            title="Restore this version"
                          >
                            {restoringId === version.id ? (
                              <span className="animate-spin h-3.5 w-3.5 border-2 border-gray-400 border-t-transparent rounded-full block" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
