import { createServerSupabase } from "../../../../lib/supabase-server";
import { redirect } from "next/navigation";
import ProfessorCourseDetailClient from "../../../../components/professor/ProfessorCourseDetailClient";

export default async function ProfessorCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
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

  if (!profile || profile.role !== "professor") redirect("/");

  const { data: course } = await supabase
    .from("courses")
    .select("id, name, invite_code, professor_id")
    .eq("id", courseId)
    .eq("professor_id", user.id)
    .single();

  if (!course) redirect("/professor");

  const { data: courseMembers } = await supabase
    .from("course_members")
    .select("user_id")
    .eq("course_id", courseId);

  const studentCount = courseMembers?.length ?? 0;

  const studentUserIds = (courseMembers ?? []).map((m: any) => m.user_id);
  const { data: studentProfilesRaw } = studentUserIds.length
    ? await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", studentUserIds)
    : { data: [] };

  const { data: teamsRaw } = await supabase
    .from("teams")
    .select("id, name, course_id, created_at")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  const teamIds = teamsRaw?.map((t) => t.id) ?? [];

  const { data: teamMembersRaw } = teamIds.length
    ? await supabase
        .from("team_members")
        .select("team_id, user_id, role")
        .in("team_id", teamIds)
    : { data: [] };

  const memberUserIds = Array.from(
    new Set((teamMembersRaw ?? []).map((m: any) => m.user_id))
  );

  const { data: memberProfiles } = memberUserIds.length
    ? await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", memberUserIds)
    : { data: [] };

  const profileMap: Record<string, { first_name: string; last_name: string }> =
    {};
  (memberProfiles ?? []).forEach((p: any) => {
    profileMap[p.id] = { first_name: p.first_name, last_name: p.last_name };
  });

  const teams = (teamsRaw ?? []).map((team: any) => {
    const members = (teamMembersRaw ?? [])
      .filter((m: any) => m.team_id === team.id)
      .map((m: any) => ({
        userId: m.user_id,
        role: m.role,
        firstName: profileMap[m.user_id]?.first_name ?? "",
        lastName: profileMap[m.user_id]?.last_name ?? "",
      }));

    const leader = members.find((m) => m.role === "LEADER") ?? members[0];

    return {
      id: team.id,
      name: team.name,
      createdAt: team.created_at,
      members,
      leaderName: leader
        ? `${leader.firstName} ${leader.lastName}`.trim()
        : "Unknown",
    };
  });

  const students = (studentProfilesRaw ?? []).map((p: any) => {
    const teamMember = (teamMembersRaw ?? []).find((m: any) => m.user_id === p.id);
    const team = teamMember ? (teamsRaw ?? []).find((t: any) => t.id === teamMember.team_id) : null;
    return {
      id: p.id,
      firstName: p.first_name ?? "",
      lastName: p.last_name ?? "",
      email: p.email ?? "",
      teamName: team?.name ?? null,
      teamId: team?.id ?? null,
    };
  });

  return (
    <ProfessorCourseDetailClient
      course={{ id: course.id, name: course.name, inviteCode: course.invite_code }}
      teams={teams}
      students={students}
      studentCount={studentCount}
    />
  );
}
