

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`
        bg-white
        border border-gray-100
        rounded-2xl
        p-6
        transition-all
        hover:border-gray-200
        hover:shadow-sm
        ${className}
      `}
    >
      {children}
    </div>
  );
}
