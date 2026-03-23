"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global boundary caught runtime exception:", error);
  }, [error]);

  return (
    <div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="p-4 rounded-full bg-red-50 dark:bg-red-950/30 text-red-500 mb-6">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">
        Something went wrong
      </h2>
      <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-sm mb-8">
        We encountered an error loading this section. Our team has been notified.
      </p>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black rounded-xl font-medium text-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white dark:focus:ring-offset-zinc-900"
      >
        <RefreshCcw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}
