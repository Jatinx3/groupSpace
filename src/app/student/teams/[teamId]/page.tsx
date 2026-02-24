import { createServerSupabase } from "../../../../lib/supabase-server";
import { deleteTeam } from "../actions";
import TeamWorkspace from "../../../../components/student/workspace/TeamWorkspace";

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div className="p-6">Not authenticated</div>;

  /* =========================
     VERIFY MEMBERSHIP
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
     FETCH TEAM
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
     FETCH COURSE
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
     FETCH MEMBERS (SAFE VERSION)
  ========================= */

  const { data: teamMembers, error: teamMembersError } = await supabase
    .from("team_members")
    .select("user_id, role")
    .eq("team_id", teamId);

  if (teamMembersError) {
    console.error("Team members error:", teamMembersError);
  }

  const userIds = teamMembers?.map((m) => m.user_id) ?? [];

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email")
    .in("id", userIds);

  if (profilesError) {
    console.error("Profiles fetch error:", profilesError);
  }

  const memberList: Member[] =
    profiles?.map((profile: any) => {
      const role = teamMembers?.find(
        (m) => m.user_id === profile.id
      )?.role;

      return {
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        role: role || "MEMBER",
      };
    }) ?? [];

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
     FETCH MESSAGES
  ========================= */

  const { data: rawMessages } = await supabase
    .from("messages")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: true });

  let messages: Message[] = [];

  if (rawMessages && rawMessages.length > 0) {
    const messageUserIds = rawMessages.map((m) => m.user_id);

    const { data: messageProfiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", messageUserIds);

    messages = rawMessages.map((msg: any) => {
      const profile = messageProfiles?.find(
        (p) => p.id === msg.user_id
      );

      return {
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        user_id: msg.user_id,
        profiles: profile
          ? {
              id: profile.id,
              full_name: `${profile.first_name} ${profile.last_name}`,
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
      inviteCode={team.join_code}
      members={memberList}
      tasks={formattedTasks}
      files={[]}
      folders={[]}
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