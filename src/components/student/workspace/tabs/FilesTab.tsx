"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Trash2,
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  X,
  Eye,
  Upload,
} from "lucide-react";
import { deleteFile, uploadFileSimple } from "../../../../app/student/teams/actions";
import FileEditor, { isEditable } from "./FileEditor";
import { downloadFile } from "../../../../lib/download";
import FilePreviewModal from "../../../shared/FilePreviewModal";

interface FileItem {
  id: string;
  file_name: string;
  file_size: number | null;
  created_at: string;
  folder_id: string | null;
  current_version: number;
  is_versioned: boolean;
  uploaded_by: {
    first_name: string;
    last_name: string;
  } | null;
}

interface Props {
  teamId: string;
  files?: FileItem[];
  isLeader: boolean;
}

export default function FilesTab({
  teamId,
  files,
  isLeader,
}: Props) {
  const safeFiles = files ?? [];
  const router = useRouter();

  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Filter to only show non-versioned simple files
  const simpleFiles = safeFiles.filter(f => !f.is_versioned);

  const totalSize = simpleFiles.reduce(
    (acc, file) => acc + (file.file_size ?? 0),
    0
  );

  /* =========================
     DELETE HANDLER
  ========================== */
  async function handleDelete(fileId: string) {
    setIsDeleting(true);

    const formData = new FormData();
    formData.append("fileId", fileId);

    await deleteFile(formData);

    setIsDeleting(false);
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Project Files</h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            {simpleFiles.length} file{simpleFiles.length !== 1 ? "s" : ""} • {formatFileSize(totalSize)}
          </p>
        </div>
      </div>

      {/* UPLOAD FILE CARD */}
      <div className="flex justify-between items-center bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-900 dark:text-white hover:opacity-80 transition">
          <Upload size={16} />
          {uploading ? "Uploading..." : "Upload File"}
          <input
            type="file"
            className="hidden"
            disabled={uploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              const formData = new FormData();
              formData.append("teamId", teamId);
              formData.append("file", file);
              await uploadFileSimple(formData);
              setUploading(false);
              router.refresh();
            }}
          />
        </label>
        <span className="text-xs text-gray-400 dark:text-zinc-500">
          Max 20MB
        </span>
      </div>

      {/* FILE LIST */}
      <div className="bg-white dark:bg-[#111111] rounded-xl shadow-sm border border-transparent dark:border-white/10 dark:overflow-hidden">
        {simpleFiles.length === 0 && (
          <div className="p-8 text-center">
            <File className="w-8 h-8 text-gray-300 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">
              No files yet — upload your first file
            </p>
          </div>
        )}

        {simpleFiles.map((file) => {
          const ext = getExtension(file.file_name);
          const Icon = getFileIcon(ext);
          const badgeColor = getBadgeColor(ext);
          const isRecent = Date.now() - new Date(file.created_at).getTime() < 5 * 60 * 1000;

          return (
            <div
              key={file.id}
              className="flex justify-between items-center px-5 py-4 hover:bg-gray-50/60 dark:hover:bg-white/5 transition border-b dark:border-white/10 last:border-none"
            >
              <div
                className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                onClick={() => setPreviewFile(file)}
              >
                <Icon size={18} className="text-gray-500 shrink-0" />

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.file_name}
                    </p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${badgeColor}`}
                    >
                      {ext.toUpperCase()}
                    </span>
                    {isRecent && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full shrink-0">
                        Updated just now
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                    {file.uploaded_by && (
                      <span>Uploaded by {file.uploaded_by.first_name}</span>
                    )}
                    <span>•</span>
                    <span>{getRelativeTime(file.created_at)}</span>
                    <span>•</span>
                    <span>{formatFileSize(file.file_size || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-3">
                {/* VIEW */}
                <button
                  onClick={() => setPreviewFile(file)}
                  className="p-2 rounded-lg text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition"
                  title="View file"
                >
                  <Eye size={15} />
                </button>

                {/* DOWNLOAD */}
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    setDownloadingId(file.id);
                    await downloadFile(`/api/files/${file.id}`, file.file_name);
                    setDownloadingId(null);
                  }}
                  className="p-2 rounded-lg text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition"
                  title="Download"
                >
                  {downloadingId === file.id ? (
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-gray-400 border-t-transparent rounded-full block" />
                  ) : (
                    <Download size={15} />
                  )}
                </button>

                {/* DELETE */}
                {isLeader && (
                  <button
                    onClick={() => setDeleteTarget(file)}
                    className="p-2 rounded-lg text-gray-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-500 transition"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* PREVIEW MODAL */}
      {previewFile && (
        <FilePreviewModal
          fileId={previewFile.id}
          fileName={previewFile.file_name}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#111111] dark:border dark:border-white/10 rounded-lg p-5 w-[320px]">
            <p className="text-sm mb-1 text-gray-900 dark:text-white font-medium">
              Delete "{deleteTarget.file_name}"?
            </p>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">
              This will permanently delete all {deleteTarget.current_version || 1} version{(deleteTarget.current_version || 1) !== 1 ? "s" : ""}.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDelete(deleteTarget.id)}
                className="text-sm text-red-600 dark:text-red-500 hover:opacity-80 transition"
              >
                {isDeleting ? "Deleting..." : "Delete File"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   HELPERS
========================= */

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function getExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() || "";
}

function isImage(filename: string) {
  return ["png", "jpg", "jpeg", "gif", "webp"].includes(
    getExtension(filename)
  );
}

function isPDF(filename: string) {
  return getExtension(filename) === "pdf";
}

function getFileIcon(ext: string) {
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext))
    return FileImage;
  if (["xls", "xlsx", "csv"].includes(ext))
    return FileSpreadsheet;
  if (["pdf", "doc", "docx"].includes(ext))
    return FileText;
  return File;
}

function getBadgeColor(ext: string) {
  if (ext === "pdf")
    return "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400";
  if (["doc", "docx"].includes(ext))
    return "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400";
  if (["png", "jpg", "jpeg", "gif"].includes(ext))
    return "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400";
  return "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-zinc-300";
}