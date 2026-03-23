"use client";

import { useState } from "react";
import CreateJoinTeamModal from "./CreateJoinTeamModal";
import TeamCard from "./TeamCard";

interface Props {
  teams: any[];
  courses: any[];
}

export default function TeamsDashboard({ teams, courses }: Props) {
  const [open, setOpen] = useState(false);

  const grouped = teams.reduce((acc: any, team: any) => {
    const courseName = team.courses?.name || "Uncategorized";
    if (!acc[courseName]) acc[courseName] = [];
    acc[courseName].push(team);
    return acc;
  }, {});

  const isPersonalCourse = (name: string) => {
    const n = name.toLowerCase();
    return (
      n.includes("hackathon") ||
      n.includes("solo project") ||
      n.includes("team project")
    );
  };

  const personalTeams = Object.entries(grouped)
    .filter(([courseName]) => isPersonalCourse(courseName))
    .flatMap(([, teams]) => teams);

  const academicTeams = Object.entries(grouped)
    .filter(([courseName]) => !isPersonalCourse(courseName));

  return (
    <div className="space-y-12">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
            My Teams
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1 text-sm">
            Organize your collaborations and projects
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-black dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-xl hover:opacity-90 transition text-sm font-semibold"
        >
          + Create Team
        </button>
      </div>

      {/* Personal Workspace */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          🚀 Personal Workspace
        </h2>

        {personalTeams.length === 0 ? (
          <EmptyState text="No personal teams yet." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalTeams.map((team: any) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </section>

      {/* Academic Courses */}
      {academicTeams.map(([courseName, teams]: any) => (
        <section key={courseName} className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            📚 {courseName}
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team: any) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </section>
      ))}

      {open && (
        <CreateJoinTeamModal
          onClose={() => setOpen(false)}
          courses={courses}
        />
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-gray-300 dark:border-white/20 rounded-2xl p-8 text-center text-gray-400 dark:text-zinc-500 text-sm bg-gray-50 dark:bg-white/5">
      {text}
    </div>
  );
}