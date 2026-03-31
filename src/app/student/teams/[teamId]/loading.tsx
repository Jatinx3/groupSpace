// Team workspace skeleton — shown while the 8+ queries run server-side
export default function Loading() {
  return (
    <div className="py-10 animate-pulse">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 dark:bg-white/10 rounded-xl" />
            <div className="h-4 w-32 bg-gray-100 dark:bg-white/5 rounded-lg" />
          </div>
          <div className="h-10 w-36 bg-gray-100 dark:bg-white/5 rounded-xl" />
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-gray-100 dark:border-white/10 pb-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-20 bg-gray-100 dark:bg-white/5 rounded-t-xl"
            />
          ))}
        </div>

        {/* Content area */}
        <div className="space-y-4">
          <div className="h-12 w-1/2 bg-gray-100 dark:bg-white/5 rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5"
              />
            ))}
          </div>
          <div className="h-48 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5" />
        </div>
      </div>
    </div>
  );
}
