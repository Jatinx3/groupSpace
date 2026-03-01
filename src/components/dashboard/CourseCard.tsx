import Card from "../ui/Card";

interface CourseCardProps {
  title: string;
  professor: string;
  progress: number;
  color: "indigo" | "emerald" | "orange" | "sky";
}

export default function CourseCard({
  title,
  professor,
  progress,
}: CourseCardProps) {
  return (
    <Card className="hover:-translate-y-0.5 transition-all duration-200">
      <h3 className="font-semibold text-gray-900">
        {title}
      </h3>

      <p className="text-sm text-gray-500 mt-1">
        {professor}
      </p>

      <div className="mt-5">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-black transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
