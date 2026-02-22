import Card from "../ui/Card";
import { Activity } from "lucide-react";

export default function ActivityFeed() {
  const activities = [
    {
      text: "You submitted Database Report",
      time: "2 hours ago",
    },
    {
      text: "New assignment posted in HCI",
      time: "Yesterday",
    },
    {
      text: "Team Alpha uploaded new files",
      time: "2 days ago",
    },
  ];

  return (
    <Card>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-xl bg-sky-100 text-sky-600">
          <Activity className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800">
          Recent Activity
        </h2>
      </div>

      <div className="space-y-6">
        {activities.map((item, index) => (
          <div key={index}>
            <p className="text-slate-700">{item.text}</p>
            <p className="text-sm text-slate-400 mt-1">
              {item.time}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
