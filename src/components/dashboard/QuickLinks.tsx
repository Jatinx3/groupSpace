import Link from "next/link";
import { BookOpen, Users, GraduationCap, ClipboardList, ArrowRight } from "lucide-react";

interface Props {
  totalCourses: number;
  totalTeams: number;
}

const links = [
  {
    label: "Courses",
    description: "Browse enrolled courses and materials",
    href: "/student/courses",
    icon: BookOpen,
  },
  {
    label: "Teams",
    description: "Collaborate with your project teams",
    href: "/student/teams",
    icon: Users,
  },
  {
    label: "Assignments",
    description: "View and manage your tasks",
    href: "/student/assignments",
    icon: ClipboardList,
  },
  {
    label: "Thesis",
    description: "Track your thesis collaboration",
    href: "/student/thesis",
    icon: GraduationCap,
  },
];

export default function QuickLinks({ totalCourses, totalTeams }: Props) {
  const badges: Record<string, number | undefined> = {
    Courses: totalCourses,
    Teams: totalTeams,
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
          Quick Access
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {links.map(({ label, description, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-gray-900 text-white group-hover:scale-105 transition-transform duration-200">
                <Icon className="w-4 h-4" />
              </div>
              {badges[label] !== undefined && (
                <span className="text-[11px] font-bold tabular-nums text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                  {badges[label]}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-none">{label}</p>
              <p className="text-xs text-gray-400 mt-1.5 leading-snug">{description}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all mt-auto" />
          </Link>
        ))}
      </div>
    </section>
  );
}
