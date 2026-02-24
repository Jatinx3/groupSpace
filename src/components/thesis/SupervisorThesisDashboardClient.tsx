"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Calendar, Clock, Loader2, Plus } from "lucide-react";

interface ThesisCard {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string | null;
  studentName: string;
  progress: number;
}

export default function SupervisorThesisDashboardClient({
  supervisorName,
  theses,
}: {
  supervisorName: string;
  theses: ThesisCard[];
}) {
  const router = useRouter();
  const [studentEmail, setStudentEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!studentEmail || !title) {
      setError("Student email and thesis title are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/professor/thesis/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentEmail,
          title,
          description,
          deadline: deadline || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Could not create thesis.");
      } else {
        setStudentEmail("");
        setTitle("");
        setDescription("");
        setDeadline("");
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <GraduationCap className="w-4 h-4" />
          <span>Thesis Collab • Supervisor View</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
          Welcome, {supervisorName}
        </h1>
        <p className="text-sm text-slate-500">
          Track progress, review milestones, and keep structured
          supervision records across all your students.
        </p>
      </header>

      {/* Create thesis for a student */}
      <section className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">
              Create thesis for a student
            </h2>
          </div>
          <p className="text-[11px] text-slate-500">
            1:1 thesis workspace per student
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start"
        >
          <input
            type="email"
            placeholder="Student university email"
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="Thesis title"
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Short description (optional)"
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex flex-col gap-2">
            <input
              type="date"
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs disabled:opacity-60"
            >
              {submitting && (
                <Loader2 className="w-3 h-3 animate-spin" />
              )}
              Create thesis
            </button>
          </div>
        </form>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </section>

      <section className="bg-white border rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Active Theses
          </h2>
          <p className="text-xs text-slate-500">
            {theses.length}{" "}
            {theses.length === 1 ? "student" : "students"}
          </p>
        </div>

        {theses.length === 0 ? (
          <p className="text-sm text-slate-500">
            You don&apos;t supervise any thesis projects yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {theses.map((t) => (
              <Link
                key={t.id}
                href={`/professor/thesis/${t.id}`}
                className="group rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
              >
                <div className="p-5 space-y-3 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                      {t.title || "Untitled Thesis"}
                    </p>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {t.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Student: {t.studentName}</span>
                    {t.deadline && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(t.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 px-5 py-3 bg-slate-50 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>{t.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full bg-indigo-500 transition-all group-hover:bg-indigo-600"
                        style={{ width: `${t.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Open</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase();

  if (normalized === "completed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
        Completed
      </span>
    );
  }

  if (
    normalized === "proposal" ||
    normalized === "research" ||
    normalized === "writing" ||
    normalized === "review"
  ) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-[10px]">
      {status || "Unknown"}
    </span>
  );
}

