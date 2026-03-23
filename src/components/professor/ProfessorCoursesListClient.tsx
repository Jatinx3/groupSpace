"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  BookOpen,
  Users,
  ArrowRight,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
} from "lucide-react";

interface Course {
  id: string;
  name: string;
  inviteCode: string;
  studentCount: number;
  teamCount: number;
}

export default function ProfessorCoursesListClient({
  courses: initialCourses,
}: {
  courses: Course[];
}) {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/professor/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setCourses((prev) => [
        { id: data.id, name: data.name, inviteCode: data.invite_code, studentCount: 0, teamCount: 0 },
        ...prev,
      ]);
      setNewName("");
      setShowCreate(false);
    } finally {
      setCreating(false);
    }
  }

  async function handleEdit(courseId: string) {
    if (!editName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/professor/api/courses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, name: editName.trim() }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, name: editName.trim() } : c));
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(courseId: string) {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    setDeletingId(courseId);
    try {
      const res = await fetch("/professor/api/courses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
      } else {
        const d = await res.json();
        setError(d.error);
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
            Teaching
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight">
            Your Courses
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Manage your courses, students, and team workspaces.
          </p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setError(null); }}
          className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 text-sm font-medium px-4 py-2.5 rounded-xl transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Course
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {showCreate && (
        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Create a new course</p>
            <button onClick={() => setShowCreate(false)} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="e.g. Data Structures · CS 210"
              className="flex-1 text-sm border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-zinc-100 transition placeholder-gray-400 dark:placeholder-zinc-600"
              autoFocus
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 text-white dark:text-gray-900 text-sm font-medium px-4 py-2.5 rounded-xl transition"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Create
            </button>
          </div>
        </div>
      )}

      {courses.length === 0 && !showCreate && (
        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/10 p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">No courses yet.</p>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Create your first course to get started.</p>
        </div>
      )}

      <div className="space-y-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/10 p-5 flex items-center gap-4 transition-colors"
          >
            <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-zinc-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              {editingId === course.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEdit(course.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 text-sm border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-zinc-100 transition"
                    autoFocus
                  />
                  <button
                    onClick={() => handleEdit(course.id)}
                    disabled={saving}
                    className="p-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1.5 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {course.name}
                </p>
              )}
              <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400 dark:text-zinc-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {course.studentCount} students
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {course.teamCount} teams
                </span>
                <span className="font-mono bg-gray-50 dark:bg-white/5 px-1.5 py-0.5 rounded text-[10px] tracking-wider border border-gray-100 dark:border-white/10 text-gray-500 dark:text-zinc-400">Code: {course.inviteCode}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { setEditingId(course.id); setEditName(course.name); setError(null); }}
                className="p-2 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition"
                title="Edit name"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(course.id)}
                disabled={deletingId === course.id}
                className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
                title="Delete course"
              >
                {deletingId === course.id
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Trash2 className="w-4 h-4" />
                }
              </button>
              <Link
                href={`/professor/courses/${course.id}`}
                className="p-2 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition"
                title="Open course"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
