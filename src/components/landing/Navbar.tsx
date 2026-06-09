"use client";

import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import Link from "next/link";
import Logo from "../ui/Logo";

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
            <Link href="/" className="transition-opacity hover:opacity-80">
              <Logo size="lg" showText={true} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:flex items-center gap-12"
          >
            {[
              { label: "Features", href: "#features" },
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
              className="px-6 py-3 bg-black text-white text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all"
            >
              Sign In
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
