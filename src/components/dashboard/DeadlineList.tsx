import Card from "../ui/Card";
import { Clock } from "lucide-react";

export default function DeadlineList() {
  const deadlines = [
    {
      title: "Database Report",
      course: "DBMS",
      daysLeft: 2,
    },
    {
      title: "UI Prototype",
      course: "HCI",
      daysLeft: 5,
    },
    {
      title: "Operating Systems Quiz",
      course: "OS",
      daysLeft: 9,
    },
  ];

  return (
    <Card>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
          <Clock className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800">
          Upcoming Deadlines
        </h2>
      </div>

      <div className="space-y-5">
        {deadlines.map((item, index) => {
          const urgency =
            item.daysLeft <= 3
              ? "border-rose-500"
              : item.daysLeft <= 7
              ? "border-amber-400"
              : "border-slate-200";

          return (
            <div
              key={index}
              className={`border-l-4 ${urgency} pl-5 py-3`}
            >
              <h3 className="font-semibold text-slate-800">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {item.course}
              </p>
              <p className="text-sm mt-2 text-slate-600">
                Due in {item.daysLeft} days
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
