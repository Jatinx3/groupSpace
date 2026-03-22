import Card from "../ui/Card";
import { BookOpen } from "lucide-react";

interface CourseCardProps {
  title: string;
  professor: string;
  progress: number;
  color?: string;
}

export default function CourseCard({
  title,
  professor,
}: CourseCardProps) {
  return (
    <Card className="hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4 text-gray-600" />
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-gray-900 transition-colors mt-1" />
      </div>
      <h3 className="font-semibold text-gray-900 leading-snug">
        {title}
      </h3>
      <p className="text-xs text-gray-400 mt-1">{professor}</p>
    </Card>
  );
}
