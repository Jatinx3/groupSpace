interface GreetingProps {
  greeting: string;
  name: string;
}

export default function Greeting({ greeting, name }: GreetingProps) {
  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
        {greeting}, {name}
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Here's what's happening in your courses today.
      </p>
    </section>
  );
}
