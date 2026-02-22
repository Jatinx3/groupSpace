"use client";

import { useState } from "react";
import CreateJoinTeamModal from "./CreateJoinTeamModal";
import TeamCard from "./TeamCard";

interface Props {
  teams: any[];
}

export default function TeamsDashboard({ teams }: Props) {
  const [open, setOpen] = useState(false);

  const activeTeams = teams.length;
  const totalMembers = teams.length * 3; // temp placeholder
  const upcomingDeadlines = 4; // temp placeholder

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold">My Teams</h1>
          <p className="text-gray-500 mt-1">
            Manage your group projects and collaborations
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2 rounded-lg shadow-md hover:opacity-90 transition"
        >
          + New Team
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard label="Active Teams" value={activeTeams} />
        <StatCard label="Total Members" value={totalMembers} />
        <StatCard label="Upcoming Deadlines" value={upcomingDeadlines} />
      </div>

      {/* Teams Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teams.map((team: any, index) => (
          <TeamCard key={team.id} team={team} index={index} />
        ))}
      </div>

      {open && <CreateJoinTeamModal onClose={() => setOpen(false)} />}
    </div>
  );
}

function StatCard({ label, value }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-semibold mt-2">{value}</p>
    </div>
  );
}