import { createServerSupabase } from "../../../lib/supabase-server";
import TeamsDashboard from "../../../components/student/workspace/TeamsDashboard";
export default async function StudentTeamsPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div>Not authenticated</div>;

  // Fetch teams
  const { data: memberships } = await supabase
    .from("team_members")
    .select(`
      team:teams (
        id,
        name,
        course_id,
        courses (
          id,
          name
        )
      )
    `)
    .eq("user_id", user.id);

  const teams =
    memberships?.map((m) => m.team).filter(Boolean) ?? [];

  return <TeamsDashboard teams={teams} />
  
  ;
  
  
}
