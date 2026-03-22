import Card from "../ui/Card";
import { Users } from "lucide-react";
import type { Team } from "../../types/team";


export default function TeamCard({ team }: { team: Team }) {
  return (
    <Card className="hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
          <Users className="w-4 h-4 text-gray-600" />
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-gray-900 transition-colors mt-1" />
      </div>
      <h3 className="font-semibold text-gray-900">{team.name}</h3>
      <p className="text-xs text-gray-400 mt-1">
        {team.courses?.[0]?.name ?? "No course"}
      </p>
    </Card>
  );
}
