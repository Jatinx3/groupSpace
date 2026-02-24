"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  FolderPlus,
  FilePlus,
  Upload,
  Trash2,
  Download,
} from "lucide-react";

import {
  createFolder,
  deleteFolder,
  uploadFile,
  createEmptyFile,
} from "../../../../app/student/teams/actions";

interface FolderItem {
  id: string;
  name: string;
  parent_id: string | null;
}

interface FileItem {
  id: string;
  file_name: string;
  folder_id: string | null;
}

interface Props {
  teamId: string;
  folders: FolderItem[];
  files: FileItem[];
  isLeader: boolean;
}

export default function StructureTab({
  teamId,
  folders,
  files,
  isLeader,
}: Props) {
  const router = useRouter();

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"folder" | "file" | null>(null);
  const [modalParent, setModalParent] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  /* =============================
     BUILD TREE
  ============================== */

  const tree = useMemo(() => {
    const folderMap: Record<string, any> = {};
    const rootFolders: any[] = [];

    folders.forEach((folder) => {
      folderMap[folder.id] = {
        ...folder,
        type: "folder",
        children: [],
      };
    });

    folders.forEach((folder) => {
      if (folder.parent_id) {
        folderMap[folder.parent_id]?.children.push(
          folderMap[folder.id]
        );
      } else {
        rootFolders.push(folderMap[folder.id]);
      }
    });

    files.forEach((file) => {
      if (!file.folder_id) return;

      const parent = folderMap[file.folder_id];
      if (parent) {
        parent.children.push({
          ...file,
          type: "file",
        });
      }
    });

    return rootFolders;
  }, [folders, files]);

  /* =============================
     STATS
  ============================== */

  const totalFiles = files.length;
  const totalFolders = folders.length;

  const fileTypes = useMemo(() => {
    const map: Record<string, number> = {};
    files.forEach((file) => {
      const ext =
        file.file_name.split(".").pop()?.toLowerCase() || "other";
      map[ext] = (map[ext] || 0) + 1;
    });
    return map;
  }, [files]);

  /* =============================
     ACTIONS
  ============================== */

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openCreateFolder(parentId: string | null) {
    setModalType("folder");
    setModalParent(parentId);
    setInputValue("");
    setModalOpen(true);
  }

  function openCreateFile(parentId: string) {
    setModalType("file");
    setModalParent(parentId);
    setInputValue("");
    setModalOpen(true);
  }

  async function handleModalSubmit() {
    if (!inputValue.trim()) return;

    const formData = new FormData();
    formData.append("teamId", teamId);

    if (modalType === "folder") {
      formData.append("name", inputValue);
      if (modalParent) formData.append("parentId", modalParent);
      await createFolder(formData);
    }

    if (modalType === "file" && modalParent) {
      formData.append("fileName", inputValue);
      formData.append("folderId", modalParent);
      await createEmptyFile(formData);
    }

    setModalOpen(false);
    router.refresh();
  }

  async function handleUpload(file: File, parentId: string) {
    const formData = new FormData();
    formData.append("teamId", teamId);
    formData.append("file", file);
    formData.append("folderId", parentId);

    await uploadFile(formData);
    router.refresh();
  }

  async function handleDeleteFolder(folder: FolderItem) {
    const hasChildren = folders.some(
      (f) => f.parent_id === folder.id
    );
    const hasFiles = files.some(
      (f) => f.folder_id === folder.id
    );

    if (hasChildren || hasFiles) {
      alert("Folder is not empty.");
      return;
    }

    const formData = new FormData();
    formData.append("folderId", folder.id);

    await deleteFolder(formData);
    router.refresh();
  }

  function handleDownloadZip() {
    window.location.href = `/api/teams/${teamId}/download`;
  }

  /* =============================
     UI
  ============================== */

  return (
    <div className="space-y-6">

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Files" value={totalFiles} />
        <StatCard title="Folders" value={totalFolders} />
        <StatCard title="Project Size" value="-- MB" />
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ===== FILE EXPLORER ===== */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">
              File Explorer
            </h2>

            <div className="flex gap-2">
              {isLeader && (
                <button
                  onClick={() => openCreateFolder(null)}
                  className="flex items-center gap-2 text-sm px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                >
                  <FolderPlus size={16} />
                  New Folder
                </button>
              )}

              <button
                onClick={handleDownloadZip}
                className="flex items-center gap-2 text-sm px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <Download size={16} />
                Download Project
              </button>
            </div>
          </div>

          <div className="p-4 space-y-1 max-h-[500px] overflow-auto">
            {tree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                expanded={expanded}
                toggle={toggle}
                level={0}
                isLeader={isLeader}
                openCreateFolder={openCreateFolder}
                openCreateFile={openCreateFile}
                onUpload={handleUpload}
                onDeleteFolder={handleDeleteFolder}
              />
            ))}
          </div>
        </div>

        {/* ===== RIGHT PANEL ===== */}
        <div className="space-y-6">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              File Type Distribution
            </h3>

            <div className="space-y-3">
              {Object.entries(fileTypes).map(([type, count]) => (
                <div
                  key={type}
                  className="flex justify-between text-sm text-gray-600"
                >
                  <span>{type.toUpperCase()}</span>
                  <span>{count} files</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Recent Files
            </h3>

            <div className="space-y-3">
              {files.slice(0, 5).map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <File size={14} />
                  {file.file_name}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ===== MODAL ===== */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold">
              {modalType === "folder" ? "Create Folder" : "Create File"}
            </h3>

            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                modalType === "folder"
                  ? "Folder name"
                  : "example.txt"
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleModalSubmit}
                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =============================
   TREE NODE
============================= */

function TreeNode({
  node,
  expanded,
  toggle,
  level,
  isLeader,
  openCreateFolder,
  openCreateFile,
  onUpload,
  onDeleteFolder,
}: any) {
  const isFolder = node.type === "folder";
  const isOpen = expanded.has(node.id);

  return (
    <div>
      <div
        className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition group"
        style={{ paddingLeft: `${level * 20}px` }}
      >
        {isFolder ? (
          <button
            onClick={() => toggle(node.id)}
            className="text-gray-400 hover:text-gray-700"
          >
            {isOpen ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}

        {isFolder ? (
          <>
            <Folder size={18} className="text-yellow-500" />
            <span className="flex-1 text-sm font-medium text-gray-700">
              {node.name}
            </span>

            {isLeader && (
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                <FolderPlus
                  size={15}
                  className="text-gray-500 hover:text-gray-800 cursor-pointer"
                  onClick={() => openCreateFolder(node.id)}
                />
                <FilePlus
                  size={15}
                  className="text-gray-500 hover:text-gray-800 cursor-pointer"
                  onClick={() => openCreateFile(node.id)}
                />
                <label className="cursor-pointer text-gray-500 hover:text-gray-800">
                  <Upload size={15} />
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onUpload(file, node.id);
                    }}
                  />
                </label>
                <Trash2
                  size={15}
                  className="text-red-400 hover:text-red-600 cursor-pointer"
                  onClick={() => onDeleteFolder(node)}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <File size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600">
              {node.file_name}
            </span>
          </>
        )}
      </div>

      {isFolder &&
        isOpen &&
        node.children.map((child: any) => (
          <TreeNode
            key={child.id}
            node={child}
            expanded={expanded}
            toggle={toggle}
            level={level + 1}
            isLeader={isLeader}
            openCreateFolder={openCreateFolder}
            openCreateFile={openCreateFile}
            onUpload={onUpload}
            onDeleteFolder={onDeleteFolder}
          />
        ))}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="text-2xl font-semibold text-gray-800">
        {value}
      </div>
      <div className="text-sm text-gray-500 mt-1">
        {title}
      </div>
    </div>
  );
}