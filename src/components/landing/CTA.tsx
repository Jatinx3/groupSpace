"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-48 px-6 bg-black text-white relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto text-center">
        <h2 className="text-[15vw] leading-[0.8] font-black tracking-tighter uppercase mb-12">
          Start
          <span className="text-neutral-600 block">Now</span>
        </h2>

        <div className="flex flex-col items-center gap-8">
          <p className="max-w-md text-xl font-medium text-neutral-400">
            Join the movement towards academic clarity.
          </p>

          <Link
            href="/login"
            className="group relative bg-white text-black px-12 py-6 text-lg font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors inline-flex items-center gap-4"
          >
            Get Access <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
