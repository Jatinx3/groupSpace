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
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
          <BookOpen className="w-4 h-4" />
        </div>
        <h2 className="font-semibold text-gray-900">
          Your Courses
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {courses.map((course, index) => (
  <CourseCard
    key={course.id}
    title={course.name}
    professor="Professor" // we can resolve later
    progress={Math.floor(Math.random() * 100)}
    color={["indigo", "emerald", "orange", "sky"][index % 4] as any}
  />
))}

      </div>
    </section>
  );
}
