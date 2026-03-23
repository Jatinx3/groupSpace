interface GreetingProps {
  greeting: string;
  name: string;
  subtitle?: string;
}

export default function Greeting({ greeting, name, subtitle }: GreetingProps) {
  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const hour = now.getHours();
  let timeEmoji = "☀️";
  let dynamicGreeting = greeting;
  
  if (hour < 5 || hour >= 22) {
    timeEmoji = "🌙";
    dynamicGreeting = "Still up? Let's get things done.";
  } else if (hour < 12) {
    timeEmoji = "🌤";
  } else if (hour < 17) {
    timeEmoji = "☀️";
  } else {
    timeEmoji = "🌙";
  }

  return (
    <section className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden relative shadow-sm transition-colors">
      <div className="px-8 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">{timeEmoji}</span>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 transition-colors">
              Dashboard
            </p>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight transition-colors">
            {hour < 5 || hour >= 22 ? dynamicGreeting : `${dynamicGreeting}, ${name}`}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400 font-medium transition-colors">
            {subtitle ?? "Here's what's happening in your courses today."}
          </p>
        </div>
        
        <div className="shrink-0 sm:text-right hidden sm:block">
          <div className="inline-flex flex-col items-end">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-1 transition-colors">Today</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-zinc-300 transition-colors">{dateLabel}</p>
          </div>
        </div>
      </div>
      
      {/* Subtle top glare effect for a premium feel (Dark Mode Only) */}
      <div className="hidden dark:block absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
