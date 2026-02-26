import Card from "../ui/Card";
import { Users } from "lucide-react";
import type { Team } from "../../types/team";


export default function TeamCard({ team }: { team: Team }) {
  return (
    <Card className="hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
          <Users className="w-4 h-4" />
        </div>
        <h3 className="font-semibold text-gray-900">
          {team.name}
        </h3>
      </div>

      <p className="text-sm text-gray-500">
        {team.courses?.[0]?.name ?? "No course"}
      </p>
    </Card>
  );
}
