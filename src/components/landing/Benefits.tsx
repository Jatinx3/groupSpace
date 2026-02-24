"use client";

import { motion } from "framer-motion";

const benefits = [
  "ELIMINATE NOISE",
  "CENTRALIZED INTEL",
  "EXECUTION FOCUSED",
  "ACADEMIC RIGOR",
  "ZERO DISTRACTIONS",
];

export default function Benefits() {
  return (
    <section className="py-32 bg-black text-white relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-24 items-start">
          <div className="sticky top-32">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8] mb-12"
            >
              Pure
              <br />
              <span className="text-neutral-500">Focus.</span>
            </motion.h2>

            <p className="text-xl md:text-2xl font-medium text-neutral-400 max-w-lg leading-relaxed">
              University life is complex enough. Your tools shouldn&apos;t add to the burden. We stripped away the
              non-essentials.
            </p>
          </div>

          <div className="space-y-0 border-l border-white/20 pl-12 md:pl-24">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="group py-12 border-b border-white/10 flex items-center gap-6"
              >
                <div className="w-4 h-4 bg-white rounded-full group-hover:scale-150 transition-transform duration-300" />
                <h3 className="text-3xl md:text-5xl font-bold uppercase tracking-tight text-neutral-500 group-hover:text-white transition-colors duration-300">
                  {benefit}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
