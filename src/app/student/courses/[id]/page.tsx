import { createServerSupabase } from "../../../../lib/supabase-server";
import { redirect } from "next/navigation";
import CourseDetail from "../../../../components/courses/CourseDetail";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: courseId } = await params;

  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch course info
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (!course) {
    redirect("/student/courses");
  }

  // Fetch ONLY teams this user belongs to in this course
  const { data: enrolledTeams } = await supabase
    .from("team_members")
    .select(`
      team_id,
      teams (
        id,
        name,
        course_id
      )
    `)
    .eq("user_id", user.id)
    .eq("teams.course_id", courseId);

  const teams =
    enrolledTeams
      ?.flatMap((item) => item.teams ?? [])
      .filter(Boolean) || [];

  return (
    <CourseDetail
      course={course}
      teams={teams}
    />
  );
}
