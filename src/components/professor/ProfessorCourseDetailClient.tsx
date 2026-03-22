"use client";

import React, { useState } from "react";
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
  Mail,
  Send,
  GraduationCap,
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

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  teamName: string | null;
  teamId: string | null;
}

interface Props {
  course: Course;
  teams: Team[];
  students: Student[];
  studentCount: number;
}

type Tab = "teams" | "students" | "announcements";

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

function InviteModal({
  course,
  studentCount,
  onClose,
}: {
  course: Course;
  studentCount: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState(course.inviteCode);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  const codeChunks = inviteCode.match(/.{1,4}/g) ?? [inviteCode];

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegenerate() {
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
    if (!email.trim()) return;
    setAdding(true);
    setAddError(null);
    setAddSuccess(false);
    try {
      const res = await fetch(`/professor/courses/${course.id}/api`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add-student", email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error); return; }
      setAddSuccess(true);
      setEmail("");
      router.refresh();
      setTimeout(() => setAddSuccess(false), 3000);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:flex-row">

        {/* LEFT — dark code panel */}
        <div className="bg-gray-900 sm:w-[52%] px-8 py-8 flex flex-col justify-between relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition sm:hidden"
          >
            <X className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                <UserPlus className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Course Code</p>
                <p className="text-xs font-semibold text-white leading-none">{course.name}</p>
              </div>
            </div>

            <div className="mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-3">Share with students</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
                {codeChunks.map((chunk, i) => (
                  <span key={i} className="font-mono text-2xl font-black tracking-widest text-white select-all">
                    {chunk}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-8 gap-1.5">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-white/10" />
              ))}
            </div>
          </div>

          <div>
            <div className="mt-8 flex gap-2">
              <button
                onClick={handleCopy}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  copied
                    ? "bg-white text-gray-900"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                }`}
              >
                {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Code</>}
              </button>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                title="Generate new code"
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition disabled:opacity-40"
              >
                <RefreshCw className={`w-4 h-4 ${regenerating ? "animate-spin" : ""}`} />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <Users className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">
                {studentCount} student{studentCount !== 1 ? "s" : ""} enrolled
              </span>
            </div>
          </div>
        </div>

        {/* Perforated divider — desktop only */}
        <div className="hidden sm:flex flex-col items-center justify-center relative w-0">
          <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-white shadow-inner" />
          <div className="h-full border-l-2 border-dashed border-gray-200" />
          <div className="absolute -left-3 bottom-0 w-6 h-6 rounded-full bg-white shadow-inner" />
        </div>

        {/* RIGHT — email panel */}
        <div className="flex-1 px-8 py-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Or add directly</p>
                <h2 className="text-base font-bold text-gray-900 mt-0.5">Add by email</h2>
              </div>
              <button
                onClick={onClose}
                className="hidden sm:flex w-8 h-8 items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-gray-400 mt-3 mb-6 leading-relaxed">
              Enter a student's email to enroll them in this course immediately.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 focus-within:border-gray-900 focus-within:bg-white transition">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddStudent()}
                  placeholder="student@university.edu"
                  className="flex-1 py-3 text-sm bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
                />
              </div>

              <button
                onClick={handleAddStudent}
                disabled={adding || !email.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition"
              >
                {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {adding ? "Adding..." : "Add Student"}
              </button>

              {addSuccess && (
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                  <Check className="w-4 h-4 text-gray-700 shrink-0" />
                  <p className="text-sm font-medium text-gray-700">Student added successfully!</p>
                </div>
              )}
              {addError && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                  <p className="text-sm text-red-600">{addError}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex items-start gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
            <p className="text-xs text-gray-500 leading-relaxed">
              Students can also join using the course code from their dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfessorCourseDetailClient({
  course,
  teams,
  students,
  studentCount,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("teams");
  const [search, setSearch] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.leaderName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredStudents = students.filter(
    (s) =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.teamName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { key: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { key: "teams", label: "Teams", icon: Users, count: teams.length },
    { key: "students", label: "Students", icon: GraduationCap, count: students.length },
    { key: "announcements", label: "Announcements", icon: Megaphone },
  ];

  return (
    <div className="space-y-6">
      {showInviteModal && (
        <InviteModal
          course={course}
          studentCount={studentCount}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      <Link
        href="/professor/courses"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </Link>

      {/* Course header card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {course.name}
            </h1>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl transition"
          >
            <UserPlus className="w-4 h-4" />
            Invite / Add Student
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="group bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-gray-900 shrink-0">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-gray-900 transition-colors duration-300" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900 tabular-nums leading-none">
              {studentCount}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-2">Registered Students</p>
          </div>
          <div className="group bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-gray-900 shrink-0">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-gray-900 transition-colors duration-300" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900 tabular-nums leading-none">
              {teams.length}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-2">Teams</p>
          </div>
        </div>
      </div>

      {/* Pill tab bar */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
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
          );
        })}
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

      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or team..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 transition"
            />
          </div>

          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                {search ? "No students match your search" : "No students enrolled yet"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Students join using the course invite code.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 grid grid-cols-12 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <div className="col-span-5">Student</div>
                <div className="col-span-4">Email</div>
                <div className="col-span-3">Team</div>
              </div>
              <div className="divide-y divide-gray-50">
                {filteredStudents.map((student, i) => {
                  const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
                  return (
                    <div key={student.id} className="grid grid-cols-12 items-center px-5 py-3.5 hover:bg-gray-50 transition group">
                      <div className="col-span-5 flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                          {initials || "?"}
                        </div>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {student.firstName} {student.lastName}
                        </p>
                      </div>
                      <div className="col-span-4 min-w-0 pr-4">
                        <p className="text-sm text-gray-500 truncate">{student.email}</p>
                      </div>
                      <div className="col-span-3">
                        {student.teamId ? (
                          <Link
                            href={`/professor/courses/${course.id}/teams/${student.teamId}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full transition"
                          >
                            {student.teamName}
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No team</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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
