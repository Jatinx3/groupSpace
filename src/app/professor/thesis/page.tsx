import { createServerSupabase } from "../../../lib/supabase-server";
import SupervisorThesisDashboardClient from "../../../components/thesis/SupervisorThesisDashboardClient";

export default async function ProfessorThesisDashboardPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "professor") {
    return null;
  }

  const { data: theses } = await supabase
    .from("thesis_projects")
    .select(
      `
      id,
      title,
      description,
      status,
      deadline,
      created_at,
      student:profiles!thesis_projects_student_id_fkey (
        id,
        first_name,
        last_name
      )
    `
    )
    .eq("supervisor_id", user.id)
    .order("created_at", { ascending: false });

  const thesisIds = theses?.map((t) => t.id) ?? [];

  const { data: milestones } = thesisIds.length
    ? await supabase
        .from("thesis_milestones")
        .select("id, thesis_id, status")
        .in("thesis_id", thesisIds)
    : { data: [] };

  const progressByThesis: Record<
    string,
    { total: number; approved: number }
  > = {};

  (milestones ?? []).forEach((m: any) => {
    const key = m.thesis_id;
    if (!progressByThesis[key]) {
      progressByThesis[key] = { total: 0, approved: 0 };
    }
    progressByThesis[key].total += 1;
    if (m.status === "approved") {
      progressByThesis[key].approved += 1;
    }
  });

  const enrichedTheses =
    theses?.map((t: any) => {
      const stats = progressByThesis[t.id] ?? {
        total: 0,
        approved: 0,
      };

      const pct =
        stats.total > 0
          ? Math.round((stats.approved / stats.total) * 100)
          : 0;

      return {
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        deadline: t.deadline,
        studentName: t.student
          ? `${t.student.first_name} ${t.student.last_name}`
          : "Unknown student",
        progress: pct,
      };
    }) ?? [];

  return (
    <SupervisorThesisDashboardClient
      supervisorName={profile.first_name}
      theses={enrichedTheses}
    />
  );
}

