"use client";

import { useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import { Menu } from "lucide-react";
import Footer from "@/src/components/layout/Footer";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
<div className="min-h-screen bg-slate-50 flex relative">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isDesktopOpen={isDesktopOpen}
        isMobileOpen={isMobileOpen}
      />

      {/* Main */}
      <main className="flex-1 flex flex-col">

        {/* Top Bar */}
        <div className="px-6 md:px-8 py-6 flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-200 transition"
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </button>

          <button
            onClick={() => setIsDesktopOpen(!isDesktopOpen)}
            className="hidden md:block p-2 rounded-xl hover:bg-slate-200 transition"
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
        </div>

        {/* Content Wrapper (controls width) */}
        <div className="flex-1 w-full">
          <div className="px-6 md:px-8 max-w-6xl mx-auto pb-12">
            {children}
          </div>
        </div>

        {/* Footer (inside same width container) */}
        <div className="w-full border-t border-slate-200">
          <div className="px-6 md:px-8 max-w-6xl mx-auto">
            <Footer />
          </div>
        </div>

      </main>
    </div>
  );
}
