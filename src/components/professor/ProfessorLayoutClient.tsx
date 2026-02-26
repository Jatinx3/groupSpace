"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClientSupabase } from "../../lib/supabase-client";
import Avatar from "../ui/Avatar";
import ProfessorSidebar from "./ProfessorSidebar";
import Footer from "../layout/Footer";

interface ProfessorLayoutClientProps {
  children: React.ReactNode;
  firstName: string;
  email: string;
  avatarUrl: string | null;
}

export default function ProfessorLayoutClient({
  children,
  firstName,
  email,
  avatarUrl,
}: ProfessorLayoutClientProps) {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const router = useRouter();
  const supabase = createClientSupabase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex relative bg-white">
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <ProfessorSidebar
        isDesktopOpen={isDesktopOpen}
        isMobileOpen={isMobileOpen}
      />

      <main className="flex-1 flex flex-col min-h-screen">
        <div className="px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-200 transition"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>

            <button
              onClick={() => setIsDesktopOpen(!isDesktopOpen)}
              className="hidden md:block p-2 rounded-lg hover:bg-slate-200 transition"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="focus:outline-none"
              >
                <Avatar name={firstName} avatarUrl={avatarUrl} size={36} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">
                      {firstName}
                    </p>
                    <p className="text-xs text-slate-500">{email}</p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 w-full bg-slate-100">
          <div className="px-6 md:px-8 max-w-6xl mx-auto pb-12 pt-8">
            {children}
          </div>
        </div>

        <div className="w-full border-t border-slate-200 bg-white">
          <div className="px-6 md:px-8 max-w-6xl mx-auto">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}
