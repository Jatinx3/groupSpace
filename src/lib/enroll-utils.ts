import { createAdminSupabase } from "./supabase-server";

const DEFAULT_COURSE_NAMES = ["Hackathon", "Solo Project", "Team Project"];

/**
 * Enrolls a user in the default courses if they aren't already.
 * Useful for automated onboarding during signup or first dashboard visit.
 */
export async function enrollInDefaultCourses(userId: string) {
  const admin = createAdminSupabase();

  // 1. Find the target courses
  const { data: courses } = await admin
    .from("courses")
    .select("id, name")
    .in("name", DEFAULT_COURSE_NAMES);

  if (!courses || courses.length === 0) {
    console.error("Default courses not found in DB.");
    return { ok: false, error: "Default courses not found" };
  }

  // 2. Check current enrollments
  const { data: existing } = await admin
    .from("course_members")
    .select("course_id")
    .eq("user_id", userId)
    .in("course_id", courses.map((c) => c.id));

  const alreadyEnrolled = new Set(existing?.map((e) => e.course_id) ?? []);

  // 3. Insert missing enrollments
  const toEnroll = courses
    .filter((c) => !alreadyEnrolled.has(c.id))
    .map((c) => ({ course_id: c.id, user_id: userId }));

  if (toEnroll.length > 0) {
    const { error } = await admin.from("course_members").insert(toEnroll);
    if (error) {
      console.error("Enrollment error:", error);
      return { ok: false, error };
    }
  }

  return { ok: true };
}
