"use client";

import { useState } from "react";
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
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const totalSize = safeFiles.reduce(
    (acc, file) => acc + (file.file_size ?? 0),
    0
  );

  return (
    <div className="space-y-8">

      {/* =========================
         HEADER STATS
      ========================== */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Project Files</h1>
          <p className="text-sm text-gray-500">
            {safeFiles.length} files • {formatFileSize(totalSize)} total
          </p>
        </div>
      </div>

      {/* =========================
         UPLOAD SECTION
      ========================== */}
      <form
        action={uploadFile}
        className="bg-white border border-gray-200 rounded-xl p-6 space-y-4"
      >
        <input type="hidden" name="teamId" value={teamId} />

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Upload className="mx-auto mb-3 text-gray-400" size={20} />
          <p className="text-sm text-gray-500">
            Drag & drop or browse files
          </p>

          <input
            type="file"
            name="file"
            required
            className="mt-4 text-sm"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-black text-white rounded-lg text-sm"
        >
          Upload File
        </button>
      </form>

      {/* =========================
         FILE LIST
      ========================== */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">

        {safeFiles.length === 0 && (
          <p className="text-sm text-gray-500">
            No files uploaded yet.
          </p>
        )}

        {safeFiles.map((file) => {
          const ext = getExtension(file.file_name);
          const Icon = getFileIcon(ext);
          const badgeColor = getBadgeColor(ext);

          return (
            <div
              key={file.id}
              className="flex justify-between items-center border rounded-xl px-5 py-4 hover:bg-gray-50 transition"
            >
              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => setPreviewFile(file)}
              >
                <Icon size={20} className="text-gray-500" />

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-sm">
                      {file.file_name}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${badgeColor}`}
                    >
                      {ext.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
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
                <a
                  href={`/api/files/${file.id}`}
                  className="text-gray-600 hover:text-black"
                >
                  <Download size={16} />
                </a>

                {isLeader && (
                  <form action={deleteFile}>
                    <input
                      type="hidden"
                      name="fileId"
                      value={file.id}
                    />
                    <button
                      type="submit"
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================
         PREVIEW MODAL
      ========================== */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-xl p-6 relative">

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