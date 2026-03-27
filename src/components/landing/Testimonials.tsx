"use client";

import { motion } from "framer-motion";
import { BackgroundPattern } from "./BackgroundPattern";

const universities = [
  "MIT",
  "STANFORD",
  "OXFORD",
  "CAMBRIDGE",
  "ETH ZÜRICH",
  "HARVARD",
  "BERKELEY",
  "PRINCETON",
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative py-24 px-6 border-b border-black/5 bg-[#F3F3F3] overflow-hidden"
    >
      <BackgroundPattern variant="architectural" opacity={0.04} />
      <div className="relative z-10 max-w-[1600px] mx-auto">
        <div className="mb-24">
          <p className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-8 text-center md:text-left">
            Deployed at major institutions
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-x-12 gap-y-6 opacity-50">
            {universities.map((uni) => (
              <span
                key={uni}
                className="text-2xl md:text-4xl font-black text-neutral-400 uppercase tracking-tighter hover:text-black transition-colors cursor-default"
              >
                {uni}
              </span>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 border-t border-black/10 pt-24">
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-medium leading-tight tracking-tight text-black"
            >
              &ldquo;Collably stripped away the administrative overhead of our research groups. We now spend 90% of
              our time on actual research, not coordination.&rdquo;
            </motion.div>

            <div className="mt-12 flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-full" />
              <div>
                <div className="text-lg font-bold uppercase tracking-wide">Dr. Sarah Jenkin</div>
                <div className="text-sm text-neutral-500 uppercase tracking-wider">
                  Department of Computer Science, MIT
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
