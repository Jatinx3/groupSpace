"use client";

import {
  Users,
  CheckSquare,
  Calendar,
  MessageSquare,
  FileText,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { BackgroundPattern } from "./BackgroundPattern";

const features: {
  icon: LucideIcon;
  title: string;
  description: string;
  id: string;
}[] = [
  {
    icon: Users,
    title: "Team Management",
    description:
      "Create and organize teams for every course. Manage members, roles, and permissions effortlessly.",
    id: "01",
  },
  {
    icon: CheckSquare,
    title: "Task Tracking",
    description:
      "Assign tasks, set deadlines, and track progress. Never miss an assignment or group deliverable again.",
    id: "02",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "Coordinate meetings and study sessions with integrated calendars. Find the perfect time for everyone.",
    id: "03",
  },
  {
    icon: MessageSquare,
    title: "Organized Discussions",
    description:
      "Topic-based channels replace chaotic group chats. Keep conversations focused and searchable.",
    id: "04",
  },
  {
    icon: FileText,
    title: "Document Hub",
    description:
      "Store and share files, notes, and resources in one centralized location. No more lost links.",
    id: "05",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    description:
      "University-grade security with role-based access. Your academic work stays protected.",
    id: "06",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative py-24 px-6 border-b border-black/5 bg-[#F3F3F3] overflow-hidden"
    >
      <BackgroundPattern variant="grid" opacity={0.04} />
      <div className="relative z-10 max-w-[1600px] mx-auto">
        <div className="mb-20 flex flex-col md:flex-row justify-between items-end gap-10">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8]">
            System
            <br />
            <span className="text-neutral-400">Capabilities</span>
          </h2>
          <p className="max-w-md text-sm font-medium uppercase tracking-wide text-neutral-500">
            A comprehensive suite of tools designed to facilitate academic excellence and collaborative efficiency.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 border-t border-l border-black/10">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
