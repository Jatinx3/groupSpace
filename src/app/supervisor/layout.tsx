import { redirect } from "next/navigation";
import { createServerSupabase } from "../../lib/supabase-server";

export default async function SupervisorLayout({
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
    .select("role, first_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "professor") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Thesis Supervision
            </h1>
            <p className="text-xs text-slate-500">
              Structured oversight across all your supervisees.
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Signed in as {profile.first_name}
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}

