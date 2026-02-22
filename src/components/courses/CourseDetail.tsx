import Card from "../ui/Card";
import { Users } from "lucide-react";

interface Course {
  id: string;
  name: string;
  invite_code: string;
}

interface Team {
  id: string;
  name: string;
}

export default function CourseDetail({
  course,
  teams,
}: {
  course: Course;
  teams: Team[];
}) {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-slate-800">
          {course.name}
        </h1>
        <p className="text-slate-500 mt-2">
          Invite Code: {course.invite_code}
        </p>
      </div>

      {/* Teams Section */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-800">
            Teams
          </h2>
        </div>

        {teams.length === 0 ? (
          <p className="text-slate-500">
            No teams created for this course yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {teams.map((team) => (
              <Card key={team.id}>
                <h3 className="text-lg font-semibold text-slate-800">
                  {team.name}
                </h3>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
