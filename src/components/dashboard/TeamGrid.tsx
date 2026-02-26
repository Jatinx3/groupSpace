import { Users } from "lucide-react";
import TeamCard from "./TeamCard";
import type { Team } from "../../types/team";

export default function TeamGrid({ teams }: { teams: Team[] }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
          <Users className="w-4 h-4" />
        </div>
        <h2 className="font-semibold text-gray-900">
          Your Teams
        </h2>
      </div>

      {teams.length === 0 ? (
        <p className="text-gray-500 text-sm">
          You're not part of any teams yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </section>
  );
}
