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
    .select("role, first_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "professor") {
    redirect("/dashboard");
  }

  const firstName = profile.first_name || "Professor";

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">
          Overview
        </p>
        <h2 className="text-2xl font-black tracking-tight uppercase text-black">
          Welcome, {firstName}
        </h2>
        <p className="text-sm text-neutral-600 max-w-xl">
          This is your central workspace for courses and thesis supervision in GroupSpace.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-black/10 rounded-xl p-5 bg-[#F9F9F9]">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">
            Teaching
          </p>
          <p className="mt-2 text-lg font-semibold text-black">
            Manage your courses
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            Review course activity, assignments, and student progress from a single place.
          </p>
        </div>

        <div className="border border-black/10 rounded-xl p-5 bg-[#F9F9F9]">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">
            Thesis Collab
          </p>
          <p className="mt-2 text-lg font-semibold text-black">
            Monitor supervisee progress
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            Use the Thesis Collab tab to track milestones, review submissions, and keep supervision structured.
          </p>
        </div>
      </section>
    </div>
  );
}
