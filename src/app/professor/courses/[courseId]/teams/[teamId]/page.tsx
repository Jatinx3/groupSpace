import { createServerSupabase, createAdminSupabase } from "../../../../../../lib/supabase-server";
import { redirect } from "next/navigation";
import ProfessorTeamWorkspaceClient from "../../../../../../components/professor/ProfessorTeamWorkspaceClient";

export default async function ProfessorTeamWorkspacePage({
  params,
}: {
  params: Promise<{ courseId: string; teamId: string }>;
}) {
  const { courseId, teamId } = await params;
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
    .select("id, name")
    .eq("id", courseId)
    .eq("professor_id", user.id)
    .single();

  if (!course) redirect(`/professor/courses`);

  const { data: team } = await supabase
    .from("teams")
    .select("id, name, course_id, created_at, join_code")
    .eq("id", teamId)
    .eq("course_id", courseId)
    .single();

  if (!team) redirect(`/professor/courses/${courseId}`);

  const adminSupabase = createAdminSupabase();

  const { data: teamMembersRaw } = await adminSupabase
    .from("team_members")
    .select("user_id, role")
    .eq("team_id", teamId);

  const userIds = teamMembersRaw?.map((m) => m.user_id) ?? [];

  const { data: memberProfiles } = userIds.length
    ? await adminSupabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", userIds)
    : { data: [] };

  const members = (memberProfiles ?? []).map((p: any) => {
    const role = teamMembersRaw?.find((m) => m.user_id === p.id)?.role ?? "MEMBER";
    return {
      id: p.id,
      firstName: p.first_name,
      lastName: p.last_name,
      email: p.email,
      role,
    };
  });

  const { data: rawMessages } = await supabase
    .from("messages")
    .select("id, content, created_at, user_id")
    .eq("team_id", teamId)
    .order("created_at", { ascending: true });

  const messageUserIds = Array.from(new Set((rawMessages ?? []).map((m) => m.user_id)));
  const { data: msgProfiles } = messageUserIds.length
    ? await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", messageUserIds)
    : { data: [] };

  const profileMap: Record<string, string> = {};
  (msgProfiles ?? []).forEach((p: any) => {
    profileMap[p.id] = `${p.first_name} ${p.last_name}`.trim();
  });

  const messages = (rawMessages ?? []).map((m: any) => ({
    id: m.id,
    content: m.content,
    createdAt: m.created_at,
    userId: m.user_id,
    senderName: profileMap[m.user_id] ?? "Unknown",
  }));

  const { data: filesRaw } = await adminSupabase
    .from("project_files")
    .select("id, file_name, file_size, created_at, uploaded_by, current_version, is_versioned")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  const { data: foldersRaw } = await adminSupabase
    .from("folders")
    .select("id, name, parent_id")
    .eq("team_id", teamId)
    .order("name", { ascending: true });

  const uploaderIds = Array.from(new Set((filesRaw ?? []).map((f: any) => f.uploaded_by).filter(Boolean)));
  const { data: uploaderProfiles } = uploaderIds.length
    ? await adminSupabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", uploaderIds)
    : { data: [] };

  const uploaderMap: Record<string, string> = {};
  (uploaderProfiles ?? []).forEach((p: any) => {
    uploaderMap[p.id] = `${p.first_name} ${p.last_name}`.trim();
  });

  const files = (filesRaw ?? []).map((f: any) => ({
    id: f.id,
    fileName: f.file_name,
    fileSize: f.file_size,
    createdAt: f.created_at,
    uploaderName: uploaderMap[f.uploaded_by] ?? "Unknown",
    currentVersion: f.current_version ?? 1,
    isVersioned: f.is_versioned ?? true,
    folder_id: (f as any).folder_id ?? null,
  }));

  const folders = (foldersRaw ?? []).map((f: any) => ({
    id: f.id,
    name: f.name,
    parent_id: f.parent_id,
  }));

  return (
    <ProfessorTeamWorkspaceClient
      courseId={courseId}
      courseName={course.name}
      teamId={teamId}
      teamName={team.name}
      inviteCode={team.join_code ?? ""}
      members={members}
      initialMessages={messages}
      files={files}
      folders={folders}
      currentUserId={user.id}
      currentUserName={profile.first_name ?? "Professor"}
    />
  );
}
