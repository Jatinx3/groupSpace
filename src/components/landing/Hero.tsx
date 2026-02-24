"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { BackgroundPattern } from "./BackgroundPattern";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1676144844767-b25cb5e6c896?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 border-b border-black/5 overflow-hidden">
      <BackgroundPattern variant="architectural" opacity={0.05} />
      <div className="relative z-10 max-w-[1600px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10"
            >
              <h1 className="text-[12vw] leading-[0.8] font-black tracking-tighter uppercase text-black">
                Group
                <br />
                <span className="text-neutral-400">Space</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-8 md:mt-12 flex flex-col md:flex-row gap-8 md:items-start"
            >
              <p className="max-w-md text-lg md:text-xl font-medium leading-snug tracking-tight text-neutral-600">
                The university collaboration platform that respects your intelligence. Minimalist. Focused. Powerful.
              </p>

              <div className="flex flex-col gap-4">
                <a
                  href="/login"
                  className="group relative overflow-hidden bg-black text-white px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors inline-flex items-center gap-2 w-fit"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Now <ArrowRight className="w-4 h-4" />
                  </span>
                </a>
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
                  No credit card required
                </span>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-4 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-200"
            >
              <Image
                src={HERO_IMAGE}
                alt="Minimalist Architecture"
                width={1080}
                height={1350}
                className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                Est. 2026
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
