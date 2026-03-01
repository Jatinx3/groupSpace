"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Search,
  Megaphone,
  Plus,
  RefreshCw,
  UserPlus,
  X,
  Loader2,
  Check,
  Copy,
  ChevronRight,
} from "lucide-react";

interface Member {
  userId: string;
  role: string;
  firstName: string;
  lastName: string;
}

interface Team {
  id: string;
  name: string;
  createdAt: string;
  members: Member[];
  leaderName: string;
}

interface Course {
  id: string;
  name: string;
  inviteCode: string;
}

interface Props {
  course: Course;
  teams: Team[];
  studentCount: number;
}

type Tab = "teams" | "announcements";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}min ago`;
  if (h < 24) return `${h}h ago`;
  if (d === 1) return "1d ago";
  return `${d}d ago`;
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function MemberAvatar({
  firstName,
  lastName,
  index,
}: {
  firstName: string;
  lastName: string;
  index: number;
}) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ring-2 ring-white ${color}`}
    >
      {initials || "?"}
    </div>
  );
}

export default function ProfessorCourseDetailClient({
  course,
  teams,
  studentCount,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("teams");
  const [search, setSearch] = useState("");
  const [inviteCode, setInviteCode] = useState(course.inviteCode);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.leaderName.toLowerCase().includes(search.toLowerCase())
  );

  async function handleRegenerateCode() {
    setRegenerating(true);
    try {
      const res = await fetch(`/professor/courses/${course.id}/api`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "new-code" }),
      });
      const data = await res.json();
      if (res.ok) setInviteCode(data.code);
    } finally {
      setRegenerating(false);
    }
  }

  async function handleAddStudent() {
    if (!addEmail.trim()) return;
    setAdding(true);
    setAddError(null);
    setAddSuccess(false);
    try {
      const res = await fetch(`/professor/courses/${course.id}/api`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add-student", email: addEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error);
        return;
      }
      setAddSuccess(true);
      setAddEmail("");
      router.refresh();
    } finally {
      setAdding(false);
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "teams", label: "Teams", count: teams.length },
    { key: "announcements", label: "Announcements" },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/professor/courses"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </Link>

      {/* Course header card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {course.name}
            </h1>
          </div>
          <button
            onClick={() => {
              setShowAddStudent(!showAddStudent);
              setAddError(null);
              setAddSuccess(false);
            }}
            className="inline-flex items-center gap-2 text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl transition"
          >
            <UserPlus className="w-4 h-4" />
            Add Student
          </button>
        </div>

        {showAddStudent && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Add student by email
              </p>
              <button
                onClick={() => setShowAddStudent(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddStudent()}
                placeholder="student@email.com"
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                autoFocus
              />
              <button
                onClick={handleAddStudent}
                disabled={adding || !addEmail.trim()}
                className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                {adding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add
              </button>
            </div>
            {addError && (
              <p className="text-xs text-red-600 mt-2">{addError}</p>
            )}
            {addSuccess && (
              <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Student added successfully.
              </p>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 shrink-0">
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">
                {studentCount}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Registered Students</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-50 shrink-0">
              <Users className="w-4 h-4 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">
                {teams.length}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Teams</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-gray-500 mb-1.5">Invite Code</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-gray-900 tracking-wider">
                {inviteCode}
              </span>
              <button
                onClick={copyCode}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition"
                title="Copy"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={handleRegenerateCode}
                disabled={regenerating}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
                title="Generate new code"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pill tab bar */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {tab.key === "teams" ? (
              <Users className="w-4 h-4 shrink-0" />
            ) : (
              <Megaphone className="w-4 h-4 shrink-0" />
            )}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  activeTab === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "teams" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search teams or members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 transition"
            />
          </div>

          {filteredTeams.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                {search ? "No teams match your search" : "No teams yet"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Students form teams using the course invite code.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTeams.map((team) => (
                <Link
                  key={team.id}
                  href={`/professor/courses/${course.id}/teams/${team.id}`}
                  className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition group block"
                >
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {team.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Led by {team.leaderName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-medium text-gray-400">
                        {timeAgo(team.createdAt)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {team.members.slice(0, 5).map((m, i) => (
                        <MemberAvatar
                          key={m.userId}
                          firstName={m.firstName}
                          lastName={m.lastName}
                          index={i}
                        />
                      ))}
                      {team.members.length > 5 && (
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-500 ring-2 ring-white shrink-0">
                          +{team.members.length - 5}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {team.members.length}{" "}
                      {team.members.length === 1 ? "member" : "members"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "announcements" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition">
              <Plus className="w-4 h-4" />
              Post Announcement
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-base font-semibold text-gray-700">
              No announcements yet
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Post an announcement to notify all students in this course.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
