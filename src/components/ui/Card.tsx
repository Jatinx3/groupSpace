

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`
        bg-white
        border border-gray-200
        rounded-xl
        p-6
        transition-all
        hover:shadow-sm
        ${className}
      `}
    >
      {children}
    </div>
  );
}
