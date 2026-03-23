import { createServerSupabase } from "../../../lib/supabase-server";
import { redirect } from "next/navigation";
import ProfessorCoursesListClient from "../../../components/professor/ProfessorCoursesListClient";

export default async function ProfessorCoursesPage() {
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

  if (!profile || profile.role !== "professor") redirect("/");

  const { data: courses } = await supabase
    .from("courses")
    .select("id, name, invite_code")
    .eq("professor_id", user.id)
    .order("created_at", { ascending: false });

  const courseIds = courses?.map((c) => c.id) ?? [];

  const { data: courseMembers } = courseIds.length
    ? await supabase
        .from("course_members")
        .select("course_id, user_id")
        .in("course_id", courseIds)
    : { data: [] };

  const { data: courseTeams } = courseIds.length
    ? await supabase
        .from("teams")
        .select("id, course_id")
        .in("course_id", courseIds)
    : { data: [] };

  const studentCountByCourse: Record<string, number> = {};
  (courseMembers ?? []).forEach((m: any) => {
    studentCountByCourse[m.course_id] = (studentCountByCourse[m.course_id] ?? 0) + 1;
  });

  const teamCountByCourse: Record<string, number> = {};
  (courseTeams ?? []).forEach((t: any) => {
    teamCountByCourse[t.course_id] = (teamCountByCourse[t.course_id] ?? 0) + 1;
  });

  const enriched = (courses ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    inviteCode: c.invite_code,
    studentCount: studentCountByCourse[c.id] ?? 0,
    teamCount: teamCountByCourse[c.id] ?? 0,
  }));

  return <ProfessorCoursesListClient courses={enriched} />;
}
