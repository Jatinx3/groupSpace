"use client";

import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import Link from "next/link";
import { BackgroundPattern } from "./BackgroundPattern";
import Logo from "../ui/Logo";

const platformLinks = [
  { label: "Features", href: "/features" },
  { label: "Security", href: "/security" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const socialIcons = [
  { Icon: Twitter, label: "Twitter" },
  { Icon: Github, label: "GitHub" },
  { Icon: Linkedin, label: "LinkedIn" },
  { Icon: Mail, label: "Email" },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#F3F3F3] border-t border-black/5 pt-24 pb-12 px-6 overflow-hidden">
      <BackgroundPattern variant="dots" opacity={0.03} />
      <div className="relative z-10 max-w-[1600px] mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-32">
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Platform</h4>
            <ul className="space-y-4">
              {platformLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-lg font-bold uppercase tracking-wide hover:text-neutral-500 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Company</h4>
            <ul className="space-y-4">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-lg font-bold uppercase tracking-wide hover:text-neutral-500 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Social</h4>
            <div className="flex gap-4">
              {socialIcons.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="w-10 h-10 border border-black/10 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-black/10 pt-12 flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="text-sm font-medium text-neutral-400 uppercase tracking-wide">
            © 2026 collably.space
            <br />
            All rights reserved.
          </div>

          <div className="select-none pointer-events-none opacity-[0.12]" style={{ transform: 'scale(1)' }}>
            <Logo size="xl" showText={true} align="center" />
          </div>
        </div>
      </div>
    </footer>
  );
}
