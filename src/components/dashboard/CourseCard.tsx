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
  color,
}: CourseCardProps) {
  const colorMap = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    orange: "bg-orange-500",
    sky: "bg-sky-500",
  };

  return (
    <Card className="hover:-translate-y-1 transition-all duration-300">
      {/* Top Accent Bar */}
      <div className={`h-2 w-full rounded-t-3xl ${colorMap[color]} -mt-8 mb-6`} />

      <h3 className="text-xl font-semibold text-slate-800">
        {title}
      </h3>

      <p className="text-sm text-slate-500 mt-2">
        {professor}
      </p>

      {/* Progress */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-slate-500 mb-2">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${colorMap[color]}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
