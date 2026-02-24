"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Download,
  Trash2,
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  X,
} from "lucide-react";
import { uploadFile, deleteFile } from "../../../../app/student/teams/actions";

interface FileItem {
  id: string;
  file_name: string;
  file_size: number | null;
  created_at: string;
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
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const totalSize = safeFiles.reduce(
    (acc, file) => acc + (file.file_size ?? 0),
    0
  );

  /* =========================
     UPLOAD HANDLER
  ========================== */
  async function handleUpload(file: File) {
    setUploadingFile(file);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("teamId", teamId);
    formData.append("file", file);

    await uploadFile(formData);

    setIsUploading(false);
    setUploadingFile(null);
    router.refresh();
  }

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
          <h1 className="text-lg font-semibold">Project Files</h1>
          <p className="text-xs text-gray-500">
            {safeFiles.length} files • {formatFileSize(totalSize)}
          </p>
        </div>
      </div>

      {/* UPLOAD CARD */}
      <div className="flex justify-between items-center bg-white border border-gray-200 rounded-lg px-4 py-3">
  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
    <Upload size={16} />
    Upload file
    <input
      type="file"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
      }}
    />
  </label>
<span className="text-xs text-gray-400">
    Max 20MB
  </span>
        {isUploading && uploadingFile && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <span className="animate-spin h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full" />
            Uploading {uploadingFile.name} (
            {formatFileSize(uploadingFile.size)})
          </div>
        )}
      </div>

      {/* FILE LIST */}
<div className="bg-white rounded-xl shadow-sm">
        {safeFiles.length === 0 && (
          <div className="p-4 text-sm text-gray-500">
            No files uploaded yet.
          </div>
        )}

        {safeFiles.map((file) => {
          const ext = getExtension(file.file_name);
          const Icon = getFileIcon(ext);
          const badgeColor = getBadgeColor(ext);

          return (
            <div
              key={file.id}
              className="flex justify-between items-center px-5 py-4 hover:bg-gray-50/60 transition border-b last:border-none"
            >
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setPreviewFile(file)}
              >
                <Icon size={18} className="text-gray-500" />

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {file.file_name}
                    </p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${badgeColor}`}
                    >
                      {ext.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 flex gap-2">
                    <span>{formatFileSize(file.file_size ?? 0)}</span>
                    <span>•</span>
                    <span>{getRelativeTime(file.created_at)}</span>
                    {file.uploaded_by && (
                      <>
                        <span>•</span>
                        <span>
                          {file.uploaded_by.first_name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">

                {/* DOWNLOAD */}
                <a
                  href={`/api/files/${file.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setDownloadingId(file.id);
                    setTimeout(() => setDownloadingId(null), 1500);
                  }}
                  className="text-gray-600 hover:text-black text-sm"
                >
                  {downloadingId === file.id
                    ? "Downloading..."
                    : <Download size={16} />}
                </a>

                {/* DELETE */}
                {isLeader && (
                  <button
                    onClick={() => setDeleteTarget(file)}
                    className="text-gray-600 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* PREVIEW MODAL */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-lg p-6 relative">

            <button
              onClick={() => setPreviewFile(null)}
              className="absolute top-4 right-4"
            >
              <X size={18} />
            </button>

            <h2 className="font-semibold mb-4">
              {previewFile.file_name}
            </h2>

            {isImage(previewFile.file_name) ? (
              <img
                src={`/api/files/${previewFile.id}`}
                className="max-h-[500px] mx-auto"
              />
            ) : isPDF(previewFile.file_name) ? (
              <iframe
                src={`/api/files/${previewFile.id}`}
                className="w-full h-[500px]"
              />
            ) : (
              <div className="text-center text-gray-500">
                Preview not available.
              </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-[320px]">
            <p className="text-sm mb-4">
              Delete "{deleteTarget.file_name}"?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-sm text-gray-500"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDelete(deleteTarget.id)}
                className="text-sm text-red-600"
              >
                {isDeleting ? "Deleting..." : "Delete"}
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
    return "bg-red-100 text-red-600";
  if (["doc", "docx"].includes(ext))
    return "bg-blue-100 text-blue-600";
  if (["png", "jpg", "jpeg", "gif"].includes(ext))
    return "bg-emerald-100 text-emerald-600";
  return "bg-gray-100 text-gray-600";
}