"use client";

import { useEffect, useState } from "react";
import { X, Cookie } from "lucide-react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const consent = localStorage.getItem("groupSpace_cookie_consent");
    if (!consent) {
      // Small delay to let the page load before sliding in
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("groupSpace_cookie_consent", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-auto md:max-w-md z-[100] animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-2xl rounded-2xl p-5 flex flex-col sm:flex-row gap-4 sm:items-center w-full relative">
        <button 
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white transition rounded-md"
          aria-label="Dismiss cookie banner temporarily"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
          <Cookie className="w-5 h-5" />
        </div>
        
        <div className="flex-1 pr-6 sm:pr-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            We use cookies
          </p>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
            This platform uses essential cookies to ensure secure sessions and custom preferences. We don't track you across the web.
          </p>
        </div>

        <button
          onClick={handleAccept}
          className="w-full sm:w-auto mt-2 sm:mt-0 px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-semibold text-xs hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shrink-0"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
