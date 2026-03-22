import { Users } from "lucide-react";
import TeamCard from "./TeamCard";
import type { Team } from "../../types/team";

export default function TeamGrid({ teams }: { teams: Team[] }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gray-900 text-white">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Collaboration
            </p>
            <h2 className="font-semibold text-gray-900 leading-none">
              Your Teams
            </h2>
          </div>
        </div>
        {teams.length > 0 && (
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            {teams.length} team{teams.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {teams.length === 0 ? (
        <p className="text-gray-400 text-sm">
          You&apos;re not part of any teams yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </section>
  );
}
