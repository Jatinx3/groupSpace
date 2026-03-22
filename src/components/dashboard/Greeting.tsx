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
  const timeEmoji = hour < 12 ? "🌤" : hour < 17 ? "☀️" : "🌙";

  return (
    <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="px-8 py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{timeEmoji}</span>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Dashboard
            </p>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 leading-tight">
            {greeting},<br />
            <span className="text-gray-700">{name}</span>
          </h1>
          <p className="mt-2 text-sm text-gray-400 font-medium">
            {subtitle ?? "Here's what's happening in your courses today."}
          </p>
        </div>
        <div className="shrink-0 sm:text-right hidden sm:block">
          <div className="inline-block bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Today</p>
            <p className="text-sm font-bold text-gray-800">{dateLabel}</p>
          </div>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-gray-900 via-gray-600 to-gray-200" />
    </section>
  );
}
