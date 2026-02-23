import StatsCard from "./StatsCard";
import { BookOpen, ClipboardList, Users, Clock } from "lucide-react";

interface Props {
  totalCourses: number;
  totalTasks: number;
  totalTeams: number;
  pendingTasks: number;
}

export default function StatsGrid({
  totalCourses,
  totalTasks,
  totalTeams,
  pendingTasks,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <StatsCard
        title="Courses"
        value={totalCourses}
        icon={BookOpen}
        color="indigo"
      />

      <StatsCard
        title="Tasks"
        value={totalTasks}
        icon={ClipboardList}
        color="orange"
      />

      <StatsCard
        title="Teams"
        value={totalTeams}
        icon={Users}
        color="emerald"
      />

      <StatsCard
        title="Pending"
        value={pendingTasks}
        icon={Clock}
        color="rose"
      />
    </div>
  );
}