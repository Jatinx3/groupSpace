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
    <section className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden relative shadow-sm">
      <div className="px-8 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">{timeEmoji}</span>
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              Dashboard
            </p>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
            {hour < 5 || hour >= 22 ? dynamicGreeting : `${dynamicGreeting}, ${name}`}
          </h1>
          <p className="mt-2 text-sm text-zinc-400 font-medium">
            {subtitle ?? "Here's what's happening in your courses today."}
          </p>
        </div>
        
        <div className="shrink-0 sm:text-right hidden sm:block">
          <div className="inline-flex flex-col items-end">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Today</p>
            <p className="text-sm font-semibold text-zinc-300">{dateLabel}</p>
          </div>
        </div>
      </div>
      
      {/* Subtle top glare effect for a premium feel */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
