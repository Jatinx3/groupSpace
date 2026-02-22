

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`
        bg-white/80
        backdrop-blur-sm
        rounded-3xl
        p-8
        shadow-sm
        transition-all
        hover:shadow-md
        ${className}
      `}
    >
      {children}
    </div>
  );
}
