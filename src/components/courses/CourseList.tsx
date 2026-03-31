"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinCourseByCode } from "../../app/student/courses/actions";
import { BookOpen, FolderDot } from "lucide-react";

interface Props {
  courses: any[];
}

export default function CourseList({ courses }: Props) {
  const [open, setOpen] = useState(false);

  const isPersonal = (name: string) => {
    const n = name.toLowerCase();
    return (
      n.includes("hackathon") ||
      n.includes("solo project") ||
      n.includes("team project")
    );
  };

  const personalCourses = courses.filter((c) => isPersonal(c.name));
  const academicCourses = courses.filter((c) => !isPersonal(c.name));

  return (
    <div className="space-y-12">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Your Courses
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Access your academic and personal workspaces
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition"
        >
          + Join Course
        </button>
      </div>

      {/* Personal Workspace */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          🚀 Personal Workspace
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {personalCourses.map((course) => (
            <CourseCard key={course.id} course={course} isPersonal={true} />
          ))}
        </div>
      </section>

      {/* Academic Courses */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          📚 Academic Courses
        </h2>

        {academicCourses.length === 0 ? (
          <EmptyState text="You haven't joined any academic courses yet." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {academicCourses.map((course) => (
              <CourseCard key={course.id} course={course} isPersonal={false} />
            ))}
          </div>
        )}
      </section>

      {open && <JoinCourseModal onClose={() => setOpen(false)} />}
    </div>
  );
}

/* ================= COURSE CARD ================= */

function CourseCard({ course, isPersonal = false }: any) {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5 p-6 shadow-sm transition-all hover:border-gray-200 dark:hover:border-white/10 cursor-default">
      
      {/* Subtle Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 dark:bg-white/[0.02] rounded-bl-[100px] -z-0 transition-colors" />

      <div className="relative z-10 flex items-start gap-4">
        {/* Semantic Icon */}
        <div className="p-3.5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100/50 dark:border-white/5 flex shrink-0 items-center justify-center text-gray-500 dark:text-zinc-400">
          {isPersonal ? <FolderDot className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
        </div>
        
        {/* Card Copy */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-1">
            {isPersonal ? "Workspace" : "Academic"}
          </p>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {course.name}
          </h3>
        </div>
      </div>
    </div>
  );
}

/* ================= EMPTY ================= */

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-gray-300 dark:border-white/10 rounded-2xl p-8 text-center text-gray-500 dark:text-zinc-500 text-sm bg-gray-50 dark:bg-[#0A0A0A]">
      {text}
    </div>
  );
}

/* ================= JOIN MODAL ================= */

function JoinCourseModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleJoin = (formData: FormData) => {
    startTransition(async () => {
      await joinCourseByCode(formData);
      router.refresh();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

      <div className="bg-white dark:bg-[#111111] w-full max-w-md rounded-3xl shadow-xl dark:shadow-2xl border border-gray-200 dark:border-white/10 p-8 relative">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white transition bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 p-1.5 rounded-lg"
        >
          ✕
        </button>

        <div className="mb-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Join Course
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Enter the invite code provided by your professor
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-1">
              💡 Pro Tip: Personal Workspaces
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-300 leading-relaxed">
              To join your personal project areas manually, use codes:<br/>
              <span className="font-mono font-bold">HACKATHON</span>, <span className="font-mono font-bold">SOLOPROJECT</span>, or <span className="font-mono font-bold">TEAMPROJECT</span>.
            </p>
          </div>
        </div>

        <form action={handleJoin} className="space-y-4">
          <input
            name="code"
            placeholder="Enter invite code"
            required
            className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 transition-colors"
          />

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50"
          >
            {isPending ? "Joining..." : "Join Course"}
          </button>
        </form>
      </div>
    </div>
  );
}