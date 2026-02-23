import { createServerSupabase } from "../../../../lib/supabase-server";
import { deleteTeam } from "../actions";
import TeamWorkspace from "../../../../components/student/workspace/TeamWorkspace";

interface Props {
  params: {
    teamId: string;
  };
}

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

type Message = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    id: string;
    full_name: string;
  } | null;
};

export default async function TeamDetailPage({ params }: Props) {
  const { teamId } = params;

  const supabase = await createServerSupabase();

  /* =========================
     AUTH CHECK
  ========================= */

  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("SERVER USER:", user);

  if (!user) {
    return <div className="p-6">Not authenticated</div>;
  }

  /* =========================
     VERIFY MEMBERSHIP (NO JOIN)
     This avoids RLS join issues
  ========================= */

const { data: membership, error } = await supabase
  .from("team_members")
  .select("*")
  .eq("team_id", teamId)
  .eq("user_id", user?.id);

console.log("MEMBERSHIP RESULT:", membership);
console.log("MEMBERSHIP ERROR:", error);

  /* =========================
     FETCH TEAM (SEPARATE QUERY)
  ========================= */

  const { data: team } = await supabase
    .from("teams")
    .select("id, name, course_id")
    .eq("id", teamId)
    .single();

  if (!team) {
    return <div className="p-6">Team not found</div>;
  }

  /* =========================
     FETCH COURSE (OPTIONAL)
  ========================= */

  let courseName: string | undefined;

  if (team.course_id) {
    const { data: course } = await supabase
      .from("courses")
      .select("name")
      .eq("id", team.course_id)
      .single();

    courseName = course?.name;
  }

  /* =========================
     FETCH MEMBERS
  ========================= */

  const { data: membersRaw } = await supabase
    .from("team_members")
    .select(`
      role,
      user:profiles (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .eq("team_id", teamId);

  const memberList: Member[] =
    membersRaw?.map((m: any) => ({
      id: m.user.id,
      first_name: m.user.first_name,
      last_name: m.user.last_name,
      email: m.user.email,
      role: m.role,
    })) ?? [];

  /* =========================
     FETCH TASKS
  ========================= */

  const { data: tasksRaw } = await supabase
    .from("tasks")
    .select(`
      id,
      team_id,
      title,
      description,
      status,
      priority,
      due_date,
      created_at,
      task_assignees (
        user:profiles (
          id,
          first_name,
          last_name,
          email
        )
      )
    `)
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  const formattedTasks =
    tasksRaw?.map((task: any) => ({
      ...task,
      assignees:
        task.task_assignees?.map((a: any) => a.user) ?? [],
    })) ?? [];

  /* =========================
     FETCH FILES
  ========================= */

  const { data: rawFiles } = await supabase
    .from("project_files")
    .select(`
      id,
      file_name,
      file_size,
      created_at,
      profiles!project_files_uploaded_by_fkey (
        first_name,
        last_name
      )
    `)
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  const files =
    rawFiles?.map((file: any) => ({
      id: file.id,
      file_name: file.file_name,
      file_size: file.file_size,
      created_at: file.created_at,
      uploaded_by: file.profiles ?? null,
    })) ?? [];

  /* =========================
     FETCH MESSAGES
  ========================= */

  const { data: rawMessages } = await supabase
    .from("messages")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: true });

  let messages: Message[] = [];

  if (rawMessages && rawMessages.length > 0) {
    const userIds = rawMessages.map((m) => m.user_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", userIds);

    messages = rawMessages.map((msg: any) => {
      const profile = profiles?.find((p) => p.id === msg.user_id);

      return {
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        user_id: msg.user_id,
        profiles: profile
          ? {
              id: profile.id,
              full_name: profile.first_name,
            }
          : null,
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
      members={memberList}
      tasks={formattedTasks}
      files={files}
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