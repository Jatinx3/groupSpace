"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinCourseByCode } from "../../app/student/courses/actions";
import Link from "next/link";

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
            <CourseCard key={course.id} course={course} />
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
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {open && <JoinCourseModal onClose={() => setOpen(false)} />}
    </div>
  );
}

/* ================= COURSE CARD ================= */

function CourseCard({ course }: any) {
  return (
    <Link href={`/student/courses/${course.id}`}>
      <div className="group bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/10 p-6 transition-all duration-200 hover:shadow-sm hover:border-gray-300 dark:hover:border-white/20 hover:-translate-y-1 cursor-pointer">

        <h3 className="text-base font-semibold text-gray-900 dark:text-white transition">
          {course.name}
        </h3>

        <div className="mt-4 h-px bg-gray-100 dark:bg-white/10" />

        <div className="mt-4 flex items-center justify-between text-xs text-gray-400 dark:text-zinc-500 font-medium">
          <span className="group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Open Course</span>
          <span className="group-hover:translate-x-1 group-hover:text-gray-900 dark:group-hover:text-white transition-all">
            →
          </span>
        </div>
      </div>
    </Link>
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

        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Join Course
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Enter the invite code provided by your professor
          </p>
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