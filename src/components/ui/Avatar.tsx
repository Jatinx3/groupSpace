import Image from "next/image";

interface AvatarProps {
  name?: string;
  avatarUrl?: string | null;
  size?: number;
}

function getInitials(name?: string) {
  if (!name || name.trim() === "") return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ name, avatarUrl, size = 36 }: AvatarProps) {
  const initials = getInitials(name);
  const fontSize = Math.max(10, Math.round(size * 0.4));

  return (
    <div
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      className="rounded-full overflow-hidden bg-gray-900 dark:bg-white flex items-center justify-center shrink-0 border border-gray-100 dark:border-white/10 relative"
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name || "Avatar"}
          fill
          sizes={`${size}px`}
          className="object-cover"
          // unoptimized fallback for blob/local preview URLs
          unoptimized={avatarUrl.startsWith("blob:") || avatarUrl.startsWith("data:")}
        />
      ) : (
        <span
          style={{ fontSize: `${fontSize}px` }}
          className="font-bold text-white dark:text-gray-900 leading-none"
        >
          {initials}
        </span>
      )}
    </div>
  );
}