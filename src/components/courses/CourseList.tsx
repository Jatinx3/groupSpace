import { BookOpen } from "lucide-react";
import CourseRow from "./CourseRow";

interface Course {
  id: string;
  name: string;
  professor_id: string;
  invite_code: string;
}

export default function CourseList({ courses }: { courses: Course[] }) {
  return (
    <section className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
          <BookOpen className="w-5 h-5" />
        </div>
        <h1 className="text-3xl font-semibold text-slate-800">
          Your Courses
        </h1>
      </div>

      {courses.length === 0 ? (
        <p className="text-slate-500">
          You’re not enrolled in any courses yet.
        </p>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <CourseRow key={course.id} course={course} />
          ))}
        </div>
      )}
    </section>
  );
}
