import { redirect } from "next/navigation";
import { createServerSupabase } from "../../lib/supabase-server";

export default async function ProfessorPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "professor") {
    redirect("/dashboard");
  }

  return (
    <div>Welcome, Professor 👨‍🏫</div>
  );
}
