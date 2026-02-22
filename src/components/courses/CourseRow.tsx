import Link from "next/link";
import Card from "../ui/Card";
import { ArrowRight } from "lucide-react";

interface Course {
  id: string;
  name: string;
  professor_id: string;
  invite_code: string;
}

export default function CourseRow({ course }: { course: Course }) {
  return (
    <Link href={`/student/courses/${course.id}`}>
      <Card className="hover:-translate-y-1 transition-all duration-300 cursor-pointer">
        <div className="flex items-center justify-between">

          <div>
            <h3 className="text-xl font-semibold text-slate-800">
              {course.name}
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Invite Code: {course.invite_code}
            </p>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-400" />
        </div>
      </Card>
    </Link>
  );
}
