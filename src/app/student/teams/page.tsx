import { createServerSupabase } from "../../../lib/supabase-server";
import TeamsDashboard from "../../../components/student/workspace/TeamsDashboard";

export default async function StudentTeamsPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div>Not authenticated</div>;

  /* Teams + Courses fetched in parallel */
  const [membershipsResult, courseMembershipsResult] = await Promise.all([
    supabase
      .from("team_members")
      .select("team:teams(id, name, course_id, courses(id, name))")
      .eq("user_id", user.id),
    supabase
      .from("course_members")
      .select("courses(id, name)")
      .eq("user_id", user.id),
  ]);

  const teams =
    membershipsResult.data?.map((m) => m.team).filter(Boolean) ?? [];

  const courses =
    courseMembershipsResult.data?.map((c) => c.courses).filter(Boolean) ?? [];

  return (
    <TeamsDashboard
      teams={teams}
      courses={courses}
    />
  );
}