"use client";

import { useEffect, useState } from "react";
import { createClientSupabase } from "@/src/lib/supabase-client";
import { AlertCircle, X, Bell, Info } from "lucide-react";

export default function AnnouncementHandler() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchAnnouncements = async () => {
      const supabase = createClientSupabase();
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .eq("status", "active")
        .order("priority", { ascending: false }); // Urgent first

      if (data) setAnnouncements(data);
    };

    const savedDismissed = localStorage.getItem("dismissed_announcements");
    if (savedDismissed) setDismissed(JSON.parse(savedDismissed));

    fetchAnnouncements();
  }, []);

  const handleDismiss = (id: string) => {
    const newList = [...dismissed, id];
    setDismissed(newList);
    localStorage.setItem("dismissed_announcements", JSON.stringify(newList));
  };

  const activeBanner = announcements.find(
    ann => ann.display_type === "banner" && !dismissed.includes(ann.id)
  );

  if (!mounted || !activeBanner) return null;

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 flex items-center gap-3 text-xs font-medium rounded-full border shadow-2xl transition-all duration-300 backdrop-blur-md animate-in slide-in-from-top-1 ${
      activeBanner.priority === 'urgent' ? 'bg-red-950/80 text-red-100 border-red-500/20' :
      activeBanner.priority === 'important' ? 'bg-amber-950/80 text-amber-100 border-amber-500/20' :
      'bg-zinc-900/80 text-zinc-100 border-zinc-800/80'
    } max-w-[90vw] md:max-w-xl`}>
      <div className="flex items-center gap-2 overflow-hidden flex-1">
        <div className={`p-1 rounded-full shrink-0 ${
          activeBanner.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
          activeBanner.priority === 'important' ? 'bg-amber-500/20 text-amber-400' :
          'bg-zinc-800 text-zinc-400'
        }`}>
          {activeBanner.priority === 'urgent' ? <AlertCircle className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
        </div>
        <span className="font-semibold whitespace-nowrap">{activeBanner.title}</span>
        <span className="text-zinc-600">|</span>
        <span className="truncate text-zinc-300">{activeBanner.content}</span>
      </div>
      {activeBanner.is_dismissible && (
        <button onClick={() => handleDismiss(activeBanner.id)} className="p-1 hover:bg-white/10 rounded-full transition text-zinc-400 hover:text-white shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
