import Link from "next/link";
import { BackgroundPattern } from "../../components/landing/BackgroundPattern";
import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";
import { Lock, Shield, Eye, Key, Server, UserCheck } from "lucide-react";

const principles = [
  {
    icon: Lock,
    id: "01",
    title: "Role-Based Access",
    description:
      "Every user — student, professor, or supervisor — operates within a strict permission boundary. Students access only their own teams and courses. Professors manage only their enrolled classes. Cross-account data is never exposed.",
  },
  {
    icon: Shield,
    id: "02",
    title: "Data Encryption",
    description:
      "All data in transit is protected with TLS 1.3. Sensitive fields at rest are encrypted using industry-standard AES-256. Your academic work and communications are never stored in plain text.",
  },
  {
    icon: Eye,
    id: "03",
    title: "Privacy by Design",
    description:
      "GroupSpace collects only what is necessary to operate the platform. We do not sell data, serve ads, or share your information with third parties. Your university data belongs to you.",
  },
  {
    icon: Key,
    id: "04",
    title: "Secure Authentication",
    description:
      "Powered by Supabase Auth with support for email-based sign-in and institutional SSO. Sessions are short-lived and invalidated immediately upon sign-out.",
  },
  {
    icon: Server,
    id: "05",
    title: "Reliable Infrastructure",
    description:
      "Hosted on cloud infrastructure with automatic backups and high availability. Your data is never at risk from a single point of failure, and recovery procedures are tested regularly.",
  },
  {
    icon: UserCheck,
    id: "06",
    title: "Audit & Transparency",
    description:
      "Key actions — file uploads, role changes, task assignments — are logged and traceable. Administrators have full visibility into platform activity without exposing individual private data.",
  },
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-[#F3F3F3] text-black font-sans selection:bg-black selection:text-white">
      <Navbar />

      <section className="relative pt-40 pb-24 px-6 border-b border-black/5 overflow-hidden">
        <BackgroundPattern variant="architectural" opacity={0.05} />
        <div className="relative z-10 max-w-[1600px] mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6">Platform</p>
          <h1 className="text-[10vw] leading-[0.8] font-black tracking-tighter uppercase text-black">
            Security
          </h1>
          <p className="mt-10 max-w-lg text-lg font-medium leading-snug tracking-tight text-neutral-600">
            Academic data deserves serious protection. GroupSpace is built with security at every layer, not bolted on as an afterthought.
          </p>
        </div>
      </section>

      <section className="relative py-24 px-6 bg-[#F3F3F3] overflow-hidden">
        <BackgroundPattern variant="grid" opacity={0.04} />
        <div className="relative z-10 max-w-[1600px] mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 border-t border-l border-black/10">
            {principles.map((item) => (
              <div
                key={item.id}
                className="group relative p-10 border-r border-b border-black/10 hover:bg-white transition-colors duration-500"
              >
                <div className="flex justify-between items-start mb-12">
                  <span className="text-xs font-bold text-neutral-400 font-mono">{item.id}</span>
                  <item.icon className="w-6 h-6 stroke-[1] text-black" />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tight mb-4 group-hover:translate-x-2 transition-transform duration-300">
                  {item.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed text-sm font-medium">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 px-6 border-t border-black/5 bg-black text-white overflow-hidden">
        <BackgroundPattern variant="dots" opacity={0.05} />
        <div className="relative z-10 max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
          <div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85]">
              Questions about
              <br />
              <span className="text-neutral-500">security?</span>
            </h2>
            <p className="mt-6 text-neutral-400 text-sm font-medium uppercase tracking-wide max-w-sm">
              Reach out to our team and we'll respond promptly with the details you need.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
