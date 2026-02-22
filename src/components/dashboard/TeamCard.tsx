import Card from "../ui/Card";
import { Users } from "lucide-react";

interface Team {
  id: string;
  name: string;
  course_id: string;
  courses?: {
    id: string;
    name: string;
  };
}

export default function TeamCard({ team }: { team: Team }) {
  return (
    <Card className="hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
          <Users className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800">
          {team.name}
        </h3>
      </div>

      <p className="text-sm text-slate-500">
        Course: {team.courses?.name ?? "Unknown"}
      </p>
    </Card>
  );
}
