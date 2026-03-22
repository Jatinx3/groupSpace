import { BookOpen } from "lucide-react";
import CourseCard from "./CourseCard";

interface Course {
  id: string;
  name: string;
  professor_id: string;
}

export default function CourseGrid({ courses }: { courses: Course[] }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gray-900 text-white">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Enrolled
            </p>
            <h2 className="font-semibold text-gray-900 leading-none">
              Your Courses
            </h2>
          </div>
        </div>
        {courses.length > 0 && (
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            {courses.length} course{courses.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {courses.length === 0 ? (
        <p className="text-gray-400 text-sm">You are not enrolled in any courses yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              title={course.name}
              professor="View details"
              progress={0}
            />
          ))}
        </div>
      )}
    </section>
  );
}
