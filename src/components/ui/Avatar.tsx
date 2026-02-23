interface AvatarProps {
  name?: string;
  avatarUrl?: string | null;
  size?: number;
}

export default function Avatar({
  name,
  avatarUrl,
  size = 36,
}: AvatarProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full overflow-hidden bg-slate-200 flex items-center justify-center shrink-0"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-sm font-semibold text-slate-600">
          {name?.charAt(0).toUpperCase() || "U"}
        </span>
      )}
    </div>
  );
}