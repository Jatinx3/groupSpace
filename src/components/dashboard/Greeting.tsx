interface GreetingProps {
  greeting: string;
  name: string;
}

export default function Greeting({ greeting, name }: GreetingProps) {
  return (
    <section>
      <h1 className="text-4xl font-semibold text-slate-800">
        {greeting}, {name} 👋
      </h1>

      <p className="mt-3 text-lg text-slate-500">
        Here’s what’s happening in your courses today.
      </p>

      <div className="mt-6 h-1 w-20 bg-indigo-500 rounded-full" />
    </section>
  );
}
