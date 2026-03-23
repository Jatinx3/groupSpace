

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`
        bg-white dark:bg-[#111111]
        border border-gray-100 dark:border-white/10
        rounded-2xl
        p-6
        transition-all
        hover:border-gray-200 dark:hover:border-white/20
        hover:shadow-sm dark:shadow-none
        ${className}
      `}
    >
      {children}
    </div>
  );
}
