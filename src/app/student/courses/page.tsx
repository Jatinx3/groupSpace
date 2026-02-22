import { createServerSupabase } from "../../../lib/supabase-server";
import { redirect } from "next/navigation";
import CourseList from "../../../components/courses/CourseList";

export default async function CoursesPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: enrolledCourses } = await supabase
    .from("course_members")
    .select(`
      course_id,
      courses (
        id,
        name,
        professor_id,
        invite_code
      )
    `)
    .eq("user_id", user.id);

  const courses =
    enrolledCourses
      ?.flatMap((item) => item.courses ?? [])
      .filter(Boolean) || [];

  return <CourseList courses={courses} />;
}
