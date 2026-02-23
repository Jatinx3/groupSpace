"use client";

import Avatar from "../../../components/ui/Avatar";

export default function ProfileAvatarSection({
  profile,
}: {
  profile: {
    first_name: string;
    avatar_url?: string | null;
  };
}) {
  return (
    <div className="flex items-center justify-center">
      <Avatar
        name={profile.first_name}
        avatarUrl={profile.avatar_url}
        size={96}
      />
    </div>
  );
}