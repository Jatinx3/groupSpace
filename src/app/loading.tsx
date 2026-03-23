import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className="absolute inset-0 blur-xl bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse" />
        <div className="relative bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
          <Loader2 className="w-8 h-8 text-black dark:text-white animate-spin" />
        </div>
      </div>
      <p className="mt-6 text-sm font-medium text-gray-500 dark:text-zinc-400 animate-pulse">
        Loading workspace...
      </p>
    </div>
  );
}
