import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, GraduationCap, ArrowRight, Users } from "lucide-react";
import { createServerSupabase } from "../../lib/supabase-server";
import Greeting from "../../components/dashboard/Greeting";
import StatsCard from "../../components/dashboard/StatsCard";
import Card from "../../components/ui/Card";

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

  const { data: courses } = await supabase
    .from("courses")
    .select("id")
    .eq("professor_id", user.id);

  const { data: theses } = await supabase
    .from("thesis_projects")
    .select("id")
    .eq("supervisor_id", user.id);

  const courseCount = courses?.length ?? 0;
  const thesisCount = theses?.length ?? 0;

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
      ? "Good afternoon"
      : "Good evening";

  return (
    <div className="space-y-12">
      <Greeting greeting={greeting} name={firstName} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatsCard
          title="Courses Taught"
          value={courseCount}
          icon={BookOpen}
          color="indigo"
        />
        <StatsCard
          title="Thesis Supervisees"
          value={thesisCount}
          icon={Users}
          color="emerald"
        />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/professor/thesis" className="group block">
          <Card className="h-full transition-all duration-200 group-hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600">
                <GraduationCap className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-200" />
            </div>
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Thesis Collab
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-800">
                Monitor supervisee progress
              </p>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Track milestones, review submissions, and keep supervision structured.
              </p>
            </div>
          </Card>
        </Link>

        <div className="group block cursor-default">
          <Card className="h-full opacity-80">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Teaching
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-800">
                Manage your courses
              </p>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Review course activity, assignments, and student progress from a single place.
              </p>
              <span className="inline-block mt-4 text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                Coming soon
              </span>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
