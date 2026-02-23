import { Users } from "lucide-react";
import TeamCard from "./TeamCard";

 interface Team {
  id: string;
  name: string;
  course_id: string;
  courses?: {
    id: string;
    name: string;
  }[];
}

export default function TeamGrid({ teams }: { teams: Team[] }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
          <Users className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800">
          Your Teams
        </h2>
      </div>

      {teams.length === 0 ? (
        <p className="text-slate-500">
          You’re not part of any teams yet.
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
