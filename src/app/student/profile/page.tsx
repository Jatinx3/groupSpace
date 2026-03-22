import { redirect } from "next/navigation";
import { createServerSupabase } from "../../../lib/supabase-server";
import StudentProfileClient from "./StudentProfileClient";

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
    .select("first_name, last_name, email, phone, role, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    redirect("/login");
  }

  return <StudentProfileClient profile={profile} />;
}
