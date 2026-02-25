import { redirect } from "next/navigation";
import { createServerSupabase } from "../../lib/supabase-server";
import LogoutButton from "../../components/auth/LogoutButton";
import ProfessorTabs from "./professor-tabs";

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
    .select("role, first_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "professor") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F3F3F3] text-black">
      <header className="border-b border-black/5 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">
              GroupSpace • Professor
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight uppercase">
              Professor Dashboard
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              Course oversight and thesis supervision in one place.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end text-[11px] uppercase tracking-[0.16em] text-neutral-500">
              <span>Signed in as</span>
              <span className="font-semibold text-black">
                {profile.first_name}
              </span>
            </div>
            <LogoutButton />
          </div>
        </div>

        <ProfessorTabs />
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white border border-black/10 rounded-2xl shadow-sm p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
