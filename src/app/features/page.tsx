import Link from "next/link";
import { BackgroundPattern } from "@/components/landing/BackgroundPattern";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  Users,
  CheckSquare,
  Calendar,
  MessageSquare,
  FileText,
  Lock,
  GitBranch,
  BookOpen,
  BarChart2,
  Bell,
} from "lucide-react";

const features = [
  {
    icon: Users,
    id: "01",
    title: "Team Management",
    description:
      "Create and organize teams for every course. Manage members, assign roles, and control permissions effortlessly. Professors can form groups manually or let the system handle it automatically based on enrollment.",
  },
  {
    icon: CheckSquare,
    id: "02",
    title: "Task Tracking",
    description:
      "Assign tasks with deadlines, priorities, and owners. Track progress in real time with a kanban-style board. Professors and supervisors get an overview of every team's workload at a glance.",
  },
  {
    icon: Calendar,
    id: "03",
    title: "Smart Scheduling",
    description:
      "Coordinate meetings and study sessions with integrated calendars. Find slots that work for everyone, send invites, and get reminders — no more back-and-forth over availability.",
  },
  {
    icon: MessageSquare,
    id: "04",
    title: "Organized Discussions",
    description:
      "Topic-based channels replace chaotic group chats. Keep conversations focused, searchable, and tied to the right project or course. Never lose important context in a sea of messages.",
  },
  {
    icon: FileText,
    id: "05",
    title: "Document Hub",
    description:
      "Store and share files, notes, and resources in one centralized location. Version history keeps track of every change, so nothing important is ever overwritten or lost.",
  },
  {
    icon: Lock,
    id: "06",
    title: "Secure & Private",
    description:
      "University-grade security with role-based access control. Students see only their own teams, professors manage their courses, and supervisors oversee thesis work — all with strict data boundaries.",
  },
  {
    icon: GitBranch,
    id: "07",
    title: "Thesis Supervision",
    description:
      "A dedicated workflow for thesis projects. Students submit proposals, supervisors leave structured feedback, and milestone tracking keeps the entire process transparent and on schedule.",
  },
  {
    icon: BookOpen,
    id: "08",
    title: "Course Integration",
    description:
      "Groups are organized by course. Professors enroll students, set deliverables, and monitor group activity — all within the context of their specific course structure.",
  },
  {
    icon: BarChart2,
    id: "09",
    title: "Progress Analytics",
    description:
      "Visual dashboards give professors and students a clear picture of where every project stands. Spot bottlenecks early and keep teams moving toward their goals.",
  },
  {
    icon: Bell,
    id: "10",
    title: "Smart Notifications",
    description:
      "Get notified about what matters — task updates, new messages, deadline reminders, and feedback from supervisors. Stay informed without being overwhelmed.",
  },
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-[#F3F3F3] text-black font-sans selection:bg-black selection:text-white">
      <Navbar />

      <section className="relative pt-40 pb-24 px-6 border-b border-black/5 overflow-hidden">
        <BackgroundPattern variant="architectural" opacity={0.05} />
        <div className="relative z-10 max-w-[1600px] mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6">Platform</p>
          <h1 className="text-[10vw] leading-[0.8] font-black tracking-tighter uppercase text-black">
            Features
          </h1>
          <p className="mt-10 max-w-lg text-lg font-medium leading-snug tracking-tight text-neutral-600">
            Everything your team needs to collaborate, stay organized, and deliver exceptional academic work.
          </p>
        </div>
      </section>

      <section className="relative py-24 px-6 bg-[#F3F3F3] overflow-hidden">
        <BackgroundPattern variant="grid" opacity={0.04} />
        <div className="relative z-10 max-w-[1600px] mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 border-t border-l border-black/10">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="group relative p-10 border-r border-b border-black/10 hover:bg-white transition-colors duration-500"
              >
                <div className="flex justify-between items-start mb-12">
                  <span className="text-xs font-bold text-neutral-400 font-mono">{feature.id}</span>
                  <feature.icon className="w-6 h-6 stroke-[1] text-black" />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tight mb-4 group-hover:translate-x-2 transition-transform duration-300">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed text-sm font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 px-6 border-t border-black/5 overflow-hidden">
        <BackgroundPattern variant="dots" opacity={0.03} />
        <div className="relative z-10 max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85]">
            Ready to
            <br />
            <span className="text-neutral-400">get started?</span>
          </h2>
          <Link
            href="/login"
            className="px-8 py-4 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
