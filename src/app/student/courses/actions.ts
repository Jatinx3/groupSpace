"use server";

import { createServerSupabase } from "../../../lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function joinCourseByCode(formData: FormData) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const code = formData.get("code")?.toString().trim();

  if (!code) {
    throw new Error("Invite code is required");
  }

  /* ======================
     Find Course By Code
  ====================== */

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("invite_code", code)
    .single();

  if (courseError || !course) {
    throw new Error("Invalid invite code");
  }

  /* ======================
     Insert Membership
  ====================== */

  const { error: insertError } = await supabase
    .from("course_members")
    .insert({
      user_id: user.id,
      course_id: course.id,
    });

  // Ignore duplicate errors safely
  if (insertError && insertError.code !== "23505") {
    throw insertError;
  }

  revalidatePath("/student/courses");
}