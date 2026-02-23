import { redirect } from "next/navigation";
import { createServerSupabase } from "../../../lib/supabase-server";
import ProfileForm from "./ProfileForm";
import ProfileAvatarSection from "./ProfileAvatarSection";
import ChangePasswordSection from "./ChangePasswordSection";

export default async function ProfilePage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email, phone, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    redirect("/login");
  }

  return (
  <div className="space-y-10">

    {/* Header */}
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Account Settings
      </h1>
      <p className="text-sm text-slate-500 mt-1">
        Manage your profile, security and preferences
      </p>
    </div>

    {/* Account Overview */}
    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-6">
      <ProfileAvatarSection profile={profile} />

      <div>
        <p className="text-lg font-semibold text-slate-900">
          {profile.first_name} {profile.last_name}
        </p>
        <p className="text-sm text-slate-500">
          {profile.email}
        </p>
        <span className="inline-block mt-2 text-xs px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full">
          Student
        </span>
      </div>
    </div>

    {/* Profile Form */}
    <ProfileForm profile={profile} />

    {/* Password Section */}
    <ChangePasswordSection />

  </div>
);}