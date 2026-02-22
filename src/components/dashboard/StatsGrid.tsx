import StatsCard from "./StatsCard";
import { BookOpen, ClipboardList, Users, Clock } from "lucide-react";

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <StatsCard
        title="Courses"
        value={4}
        icon={BookOpen}
        color="indigo"
      />

      <StatsCard
        title="Assignments"
        value={3}
        icon={ClipboardList}
        color="orange"
      />

      <StatsCard
        title="Teams"
        value={2}
        icon={Users}
        color="emerald"
      />

      <StatsCard
        title="Deadlines"
        value={1}
        icon={Clock}
        color="rose"
      />
    </div>
  );
}
