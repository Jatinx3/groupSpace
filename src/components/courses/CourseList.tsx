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

  const personalNames = [
    "Hackathons",
    "Solo Projects",
    "Team Projects",
  ];

  const personalCourses = courses.filter((c) =>
    personalNames.includes(c.name)
  );

  const academicCourses = courses.filter(
    (c) => !personalNames.includes(c.name)
  );

  return (
    <div className="space-y-12">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Your Courses
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Access your academic and personal workspaces
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-black text-white px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition"
        >
          + Join Course
        </button>
      </div>

      {/* Personal Workspace */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold">
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
        <h2 className="text-lg font-semibold">
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
      <div className="group bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer">

        <h3 className="text-base font-semibold text-gray-900 group-hover:text-black transition">
          {course.name}
        </h3>

        <div className="mt-4 h-px bg-gray-100" />

        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <span>Open Course</span>
          <span className="group-hover:translate-x-1 transition-transform">
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
    <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-400 text-sm bg-gray-50">
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 relative">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-black transition"
        >
          ✕
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight">
            Join Course
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter the invite code provided by your professor
          </p>
        </div>

        <form action={handleJoin} className="space-y-4">
          <input
            name="code"
            placeholder="Enter invite code"
            required
            className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {isPending ? "Joining..." : "Join Course"}
          </button>
        </form>
      </div>
    </div>
  );
}