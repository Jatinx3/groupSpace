"use client";

import { useState } from "react";
import { createClientSupabase } from "../../../lib/supabase-client";

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  avatar_url?: string;
}

export default function ProfileForm({
  profile,
}: {
  profile: Profile;
}) {
  const supabase = createClientSupabase();

  const [firstName, setFirstName] = useState(profile.first_name || "");
  const [lastName, setLastName] = useState(profile.last_name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone,
        avatar_url: avatarUrl,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const filePath = `${user.id}-${Date.now()}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    setAvatarUrl(data.publicUrl);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-2xl space-y-8">

      {/* Avatar Section */}
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-200">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-slate-600">
              {firstName?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 cursor-pointer">
            Change photo
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* First Name */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          First Name
        </label>
        <input
          type="text"
          className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      {/* Last Name */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Last Name
        </label>
        <input
          type="text"
          className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      {/* Email */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          type="email"
          className="mt-2 w-full p-3 border rounded-lg bg-slate-100 cursor-not-allowed"
          value={profile.email}
          disabled
        />
      </div>

      {/* Phone */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Phone
        </label>
        <input
          type="text"
          className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}

      {success && (
        <div className="text-sm text-green-600">
          Profile updated successfully.
        </div>
      )}

      <button
        onClick={handleUpdate}
        disabled={loading}
        className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}