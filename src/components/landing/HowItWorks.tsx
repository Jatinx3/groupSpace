"use client";

import { motion } from "framer-motion";
import { BackgroundPattern } from "./BackgroundPattern";

const steps = [
  {
    number: "01",
    title: "Initiate Workspace",
    description:
      "Authenticate via university credentials. Establish your primary command center in seconds.",
  },
  {
    number: "02",
    title: "Configure Modules",
    description:
      "Deploy course structures. Integrate team members. Set permissions and access protocols.",
  },
  {
    number: "03",
    title: "Execute & Collaborate",
    description:
      "Distribute assignments. Synchronize resources. Achieve academic objectives with precision.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-24 px-6 bg-[#F3F3F3] border-b border-black/5 overflow-hidden">
      <BackgroundPattern variant="dots" opacity={0.05} />
      <div className="relative z-10 max-w-[1600px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 mb-24">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8]">
            Operational
            <br />
            <span className="text-neutral-400">Sequence</span>
          </h2>
        </div>

        <div className="flex flex-col">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group border-t border-black/10 py-16 grid md:grid-cols-12 gap-8 items-start hover:bg-white transition-colors duration-500 px-4"
            >
              <div className="md:col-span-2">
                <span className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-neutral-200 group-hover:text-black transition-colors duration-500 font-mono tracking-tighter">
                  {step.number}
                </span>
              </div>
              <div className="md:col-span-4 md:col-start-4">
                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight">{step.title}</h3>
              </div>
              <div className="md:col-span-4 md:col-start-9">
                <p className="text-lg font-medium text-neutral-600 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
          <div className="border-t border-black/10" />
        </div>
      </div>
    </section>
  );
}
