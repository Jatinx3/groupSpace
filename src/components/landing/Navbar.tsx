"use client";

import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#F3F3F3]/80 backdrop-blur-md z-50 border-b border-black/5">
      <div className="w-full px-6 md:px-12 py-6">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Link href="/" className="text-xl md:text-2xl font-black tracking-tighter uppercase text-black">
              Group Space
            </Link>
            <span className="hidden md:inline-block w-2 h-2 bg-black rounded-full mt-1" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:flex items-center gap-12"
          >
            {[
              { label: "Features", href: "#features" },
              { label: "Demo", href: "#demo" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-bold uppercase tracking-wide text-neutral-500 hover:text-black transition-colors"
              >
                {item.label}
              </a>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-6"
          >
            <Link
              href="/login"
              className="hidden md:block text-sm font-bold uppercase tracking-wide hover:underline decoration-2 underline-offset-4"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 bg-black text-white text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all"
            >
              Get Access
            </Link>
            <button type="button" className="md:hidden" aria-label="Open menu">
              <Menu className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      </div>
    </nav>
  );
}
