import { redirect } from "next/navigation";
import { createServerSupabase } from "../../lib/supabase-server";
import LogoutButton from "../../components/auth/LogoutButton";

export default async function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-between items-center p-6 bg-white shadow">
        <h1 className="text-xl font-bold">Professor Dashboard</h1>
        <LogoutButton />
      </div>

      <div className="p-6">{children}</div>
    </div>
  );
}
