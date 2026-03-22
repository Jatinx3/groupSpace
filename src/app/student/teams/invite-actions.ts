"use server";

import { createServerSupabase, createAdminSupabase } from "../../../lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function addMemberByEmail(
  teamId: string,
  email: string
) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Ensure leader
  const { data: membership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single();

  if (!membership || membership.role !== "LEADER") {
    throw new Error("Unauthorized");
  }

  // Find user by email
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (!profile) throw new Error("User not found");

  const admin = createAdminSupabase();

  // Check the team belongs to a course and the invitee is enrolled in it
  const { data: team } = await admin
    .from("teams")
    .select("id, name, course_id")
    .eq("id", teamId)
    .single();

  if (team?.course_id) {
    const { data: courseMembership } = await admin
      .from("course_members")
      .select("user_id")
      .eq("course_id", team.course_id)
      .eq("user_id", profile.id)
      .single();

    if (!courseMembership) {
      const { data: course } = await admin
        .from("courses")
        .select("name")
        .eq("id", team.course_id)
        .single();

      throw new Error(
        `This user is not enrolled in "${course?.name ?? "this course"}". They must join the course first before being added to the team.`
      );
    }
  }

  const { error } = await admin
    .from("team_members")
    .insert({
      team_id: teamId,
      user_id: profile.id,
      role: "MEMBER",
    });

  if (error && error.code !== "23505") throw error;

  const { data: inviterProfile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single();

  const inviterName = inviterProfile
    ? `${inviterProfile.first_name} ${inviterProfile.last_name}`.trim()
    : "A teammate";

  await admin.from("notifications").insert({
    user_id: profile.id,
    type: "team",
    title: "Added to Team",
    message: `${inviterName} added you to the team "${team?.name ?? "a team"}"`,
    read: false,
  });

  revalidatePath(`/student/teams/${teamId}`);
}