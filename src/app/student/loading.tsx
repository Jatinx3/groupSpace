// Dashboard skeleton — shown by Next.js while student/page.tsx server-renders
export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Greeting */}
      <div className="space-y-2">
        <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded-lg" />
        <div className="h-8 w-64 bg-gray-200 dark:bg-white/10 rounded-xl" />
      </div>

      {/* Stats grid — 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5"
          />
        ))}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left — deadlines + progress */}
        <div className="xl:col-span-2 space-y-6">
          <div className="h-64 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5" />
          <div className="h-48 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5" />
        </div>

        {/* Right — calendar + activity */}
        <div className="space-y-6">
          <div className="h-56 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5" />
          <div className="h-48 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5" />
        </div>
      </div>
    </div>
  );
}
