import { createServerSupabase, createAdminSupabase } from "../../../../lib/supabase-server";
import { deleteTeam } from "../actions";
import TeamWorkspace from "../../../../components/student/workspace/TeamWorkspace";

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
};

type Message = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  } | null;
};

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;

  if (!teamId) {
    return <div className="p-6">Invalid team</div>;
  }

  const supabase = await createServerSupabase();
  const admin = createAdminSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div className="p-6">Not authenticated</div>;

  /* =========================
     VERIFY MEMBERSHIP (must be sequential — gates everything below)
  ========================= */
  const { data: membershipRows, error: membershipError } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id);

  if (membershipError) {
    console.error("Membership error:", membershipError);
    return <div className="p-6">Error loading team</div>;
  }

  if (!membershipRows || membershipRows.length === 0) {
    return <div className="p-6">Team not found</div>;
  }

  const isLeader = membershipRows[0].role === "LEADER";

  /* =========================
     FETCH TEAM (must be sequential — course_id needed for course + member guard)
  ========================= */
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, name, course_id, join_code")
    .eq("id", teamId)
    .single();

  if (teamError || !team) {
    console.error("Team fetch error:", teamError);
    return <div className="p-6">Team not found</div>;
  }

  /* =========================
     ALL REMAINING DATA IN PARALLEL
  ========================= */
  const [
    courseResult,
    teamMembersResult,
    tasksResult,
    messagesResult,
    foldersResult,
    filesResult,
  ] = await Promise.all([
    // Course name (optional)
    team.course_id
      ? supabase.from("courses").select("name").eq("id", team.course_id).single()
      : Promise.resolve({ data: null }),

    // Team members + profiles (admin to bypass RLS)
    admin.from("team_members").select("user_id, role").eq("team_id", teamId),

    // Tasks with assignees
    supabase
      .from("tasks")
      .select(`
        id, team_id, title, description, status, priority, due_date, created_at,
        task_assignees(user:profiles(id, first_name, last_name, email))
      `)
      .eq("team_id", teamId)
      .order("created_at", { ascending: false }),

    // Last 50 messages (scoped fields — was select("*"))
    supabase
      .from("messages")
      .select("id, content, created_at, user_id")
      .eq("team_id", teamId)
      .order("created_at", { ascending: true })
      .limit(50),

    // Folders
    supabase
      .from("folders")
      .select("id, name, parent_id")
      .eq("team_id", teamId),

    // Files
    supabase
      .from("project_files")
      .select("id, file_name, file_size, created_at, folder_id, uploaded_by, current_version, latest_version_id, is_versioned")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false }),
  ]);

  /* =========================
     PROCESS TEAM MEMBERS
  ========================= */
  const courseName = courseResult.data?.name;

  const teamMembers = teamMembersResult.data ?? [];
  const userIds = teamMembers.map((m) => m.user_id);

  const { data: profiles } = userIds.length
    ? await admin
        .from("profiles")
        .select("id, first_name, last_name, email, avatar_url")
        .in("id", userIds)
    : { data: [] };

  const memberList: Member[] =
    (profiles ?? []).map((profile: any) => ({
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      role: teamMembers.find((m) => m.user_id === profile.id)?.role ?? "MEMBER",
      avatar_url: profile.avatar_url,
    }));

  /* =========================
     PROCESS TASKS
  ========================= */
  const formattedTasks =
    (tasksResult.data ?? []).map((task: any) => ({
      ...task,
      assignees: task.task_assignees?.map((a: any) => a.user) ?? [],
    }));

  /* =========================
     PROCESS MESSAGES (resolve sender profiles)
  ========================= */
  const rawMessages = messagesResult.data ?? [];
  let messages: Message[] = [];

  if (rawMessages.length > 0) {
    const messageUserIds = [...new Set(rawMessages.map((m) => m.user_id))];
    const { data: messageProfiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, avatar_url")
      .in("id", messageUserIds);

    const profileMap = new Map(
      (messageProfiles ?? []).map((p) => [p.id, p])
    );

    messages = rawMessages.map((msg: any) => {
      const profile = profileMap.get(msg.user_id);
      return {
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        user_id: msg.user_id,
        profiles: profile
          ? {
              id: profile.id,
              full_name: `${profile.first_name} ${profile.last_name}`,
              avatar_url: profile.avatar_url,
            }
          : null,
      };
    });
  }

  /* =========================
     PROCESS FILES + VERSIONS (parallel sub-queries)
  ========================= */
  const folders = foldersResult.data ?? [];
  const filesRaw = filesResult.data ?? [];
  let files: any[] = [];

  if (filesRaw.length > 0) {
    const uploaderIds = [...new Set(filesRaw.map((f: any) => f.uploaded_by).filter(Boolean))];
    const versionIds = filesRaw.map((f: any) => f.latest_version_id).filter(Boolean);

    // Fetch uploaders and version info in parallel
    const [uploaderResult, versionsResult] = await Promise.all([
      uploaderIds.length
        ? supabase.from("profiles").select("id, first_name, last_name").in("id", uploaderIds)
        : Promise.resolve({ data: [] }),
      versionIds.length
        ? supabase.from("file_versions").select("id, uploaded_by, change_message, created_at").in("id", versionIds)
        : Promise.resolve({ data: [] }),
    ]);

    const uploaders = uploaderResult.data ?? [];
    const versions = versionsResult.data ?? [];

    // Resolve version uploader names
    const versionUploaderIds = [...new Set(versions.map((v: any) => v.uploaded_by).filter(Boolean))];
    const { data: vProfiles } = versionUploaderIds.length
      ? await supabase.from("profiles").select("id, first_name, last_name").in("id", versionUploaderIds)
      : { data: [] };

    const versionUploaderMap = new Map(
      (vProfiles ?? []).map((p: any) => [p.id, `${p.first_name} ${p.last_name}`.trim()])
    );

    const versionMap = new Map(
      versions.map((v: any) => [
        v.id,
        {
          uploaderName: versionUploaderMap.get(v.uploaded_by) ?? null,
          changeMessage: v.change_message,
          createdAt: v.created_at,
        },
      ])
    );

    const uploaderMap = new Map(uploaders.map((p: any) => [p.id, p]));

    files = filesRaw.map((file: any) => {
      const uploader = uploaderMap.get(file.uploaded_by) ?? null;
      const versionInfo = file.latest_version_id ? versionMap.get(file.latest_version_id) : null;
      return {
        id: file.id,
        file_name: file.file_name,
        file_size: file.file_size,
        created_at: file.created_at,
        folder_id: file.folder_id,
        current_version: file.current_version ?? 1,
        uploaded_by: uploader
          ? { first_name: uploader.first_name, last_name: uploader.last_name }
          : null,
        version_uploader: versionInfo?.uploaderName ?? null,
        version_message: versionInfo?.changeMessage ?? null,
        version_created_at: versionInfo?.createdAt ?? null,
        is_versioned: file.is_versioned ?? true,
      };
    });
  }

  /* =========================
     RETURN
  ========================= */
  return (
    <TeamWorkspace
      teamId={teamId}
      teamName={team.name}
      courseName={courseName}
      inviteCode={team.join_code}
      members={memberList}
      tasks={formattedTasks}
      files={files}
      folders={folders}
      isLeader={isLeader}
      messages={messages}
      currentUserId={user.id}
      onDelete={
        isLeader
          ? async () => {
              "use server";
              await deleteTeam(teamId);
            }
          : undefined
      }
    />
  );
}