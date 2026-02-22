import { createServerSupabase } from "../../../../lib/supabase-server";
import { deleteTeam } from "../actions";
import TeamWorkspace from "../../../../components/student/workspace/TeamWorkspace";

interface Props {
  params: Promise<{
    teamId: string;
  }>;
}

type Member = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

type Task = {
  id: string;
  team_id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
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

export default async function TeamDetailPage(props: Props) {
  const { teamId } = await props.params;

  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-6">Not authenticated</div>;
  }

  // 🔹 Verify membership
  const { data: membership } = await supabase
    .from("team_members")
    .select(`
      role,
      team:teams (
        id,
        name,
        courses (
          id,
          name
        )
      )
    `)
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    return (
      <div className="p-6">
        Team not found
        <pre>
          {JSON.stringify({ teamId, userId: user.id }, null, 2)}
        </pre>
      </div>
    );
  }

  const isLeader = membership.role === "LEADER";
  const team = membership.team;
  const course = team.courses?.[0];

  // 🔹 Fetch members
  const { data: members } = await supabase
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
    members?.map((m) => ({
      id: m.user.id,
      first_name: m.user.first_name,
      last_name: m.user.last_name,
      email: m.user.email,
      role: m.role,
    })) ?? [];

  // 🔹 Fetch tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  // 🔹 Fetch raw messages
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
    .select("id, full_name")
    .in("id", userIds);

  messages = rawMessages.map((msg) => ({
    id: msg.id,
    content: msg.content,
    created_at: msg.created_at,
    user_id: msg.user_id,
    profiles:
      profiles?.find((p) => p.id === msg.user_id) ?? null,
  }));
}
  return (
    <TeamWorkspace
      teamId={teamId}
      teamName={team.name}
      courseName={course?.name}
      members={memberList}
      tasks={(tasks ?? []) as Task[]}
      isLeader={isLeader}
      messages={(messages ?? []) as Message[]}
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