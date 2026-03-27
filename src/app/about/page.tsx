import Link from "next/link";
import { BackgroundPattern } from "../../components/landing/BackgroundPattern";
import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";

const values = [
  {
    id: "01",
    title: "Simplicity First",
    description:
      "We believe great tools get out of the way. Collably is intentionally minimal — every feature earns its place by solving a real problem for students and educators.",
  },
  {
    id: "02",
    title: "Built for Academia",
    description:
      "Collably isn't a generic project manager dressed up for universities. It was designed from the ground up around how courses, thesis work, and student teams actually operate.",
  },
  {
    id: "03",
    title: "Transparency",
    description:
      "Students know what's expected. Professors know what's happening. Supervisors have the visibility they need. We build tools that make accountability natural, not forced.",
  },
  {
    id: "04",
    title: "Continuous Improvement",
    description:
      "Collably is actively developed. We listen closely to users — students, professors, and supervisors — and iterate based on real classroom experience, not assumptions.",
  },
];

const stats = [
  { value: "2026", label: "Founded" },
  { value: "3", label: "User Roles" },
  { value: "100%", label: "Academic Focus" },
  { value: "0", label: "Ads. Ever." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F3F3F3] text-black font-sans selection:bg-black selection:text-white">
      <Navbar />

      <section className="relative pt-40 pb-24 px-6 border-b border-black/5 overflow-hidden">
        <BackgroundPattern variant="architectural" opacity={0.05} />
        <div className="relative z-10 max-w-[1600px] mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6">Company</p>
          <h1 className="text-[10vw] leading-[0.8] font-black tracking-tighter uppercase text-black">
            About
          </h1>
          <p className="mt-10 max-w-xl text-lg font-medium leading-snug tracking-tight text-neutral-600">
            Collably was born out of a simple frustration: academic collaboration tools were either too generic, too bloated, or too fragile. We built something better.
          </p>
        </div>
      </section>

      <section className="relative py-24 px-6 border-b border-black/5 overflow-hidden">
        <BackgroundPattern variant="dots" opacity={0.03} />
        <div className="relative z-10 max-w-[1600px] mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-start">
            <div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] mb-10">
                Why we
                <br />
                <span className="text-neutral-400">exist</span>
              </h2>
              <div className="space-y-6 text-neutral-600 text-sm font-medium leading-relaxed">
                <p>
                  Most university group work happens across a patchwork of tools — WhatsApp for messages, Google Drive for files, email for formal updates, and spreadsheets for tracking tasks. Nothing talks to anything else, and important context falls through the cracks.
                </p>
                <p>
                  Collably brings it all together. One place for your team, your tasks, your documents, and your conversations — organized around the courses and projects that matter.
                </p>
                <p>
                  We designed specifically for three types of users: students who need to collaborate, professors who need to manage and monitor, and supervisors who need to guide thesis work. Each role has the right tools and the right level of visibility.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 border-t border-l border-black/10">
              {stats.map((stat) => (
                <div key={stat.label} className="p-10 border-r border-b border-black/10">
                  <p className="text-5xl font-black tracking-tighter mb-2">{stat.value}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 px-6 border-b border-black/5 overflow-hidden">
        <BackgroundPattern variant="grid" opacity={0.04} />
        <div className="relative z-10 max-w-[1600px] mx-auto">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] mb-20">
            What we
            <br />
            <span className="text-neutral-400">believe</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 border-t border-l border-black/10">
            {values.map((value) => (
              <div
                key={value.id}
                className="group p-10 border-r border-b border-black/10 hover:bg-white transition-colors duration-500"
              >
                <span className="text-xs font-bold text-neutral-400 font-mono block mb-12">{value.id}</span>
                <h3 className="text-xl font-bold uppercase tracking-tight mb-4 group-hover:translate-x-2 transition-transform duration-300">
                  {value.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed text-sm font-medium">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 px-6 border-t border-black/5 overflow-hidden">
        <BackgroundPattern variant="dots" opacity={0.03} />
        <div className="relative z-10 max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85]">
            Have a
            <br />
            <span className="text-neutral-400">question?</span>
          </h2>
          <Link
            href="/contact"
            className="px-8 py-4 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
