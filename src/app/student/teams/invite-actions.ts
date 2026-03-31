"use server";

import { createServerSupabase, createAdminSupabase } from "../../../lib/supabase-server";
import { revalidatePath } from "next/cache";

type InviteResult =
  | { success: true }
  | { error: string };

export async function addMemberByEmail(
  teamId: string,
  email: string
): Promise<InviteResult> {
  try {
    const supabase = await createServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "You must be logged in to invite members." };

    // Ensure leader
    const { data: membership } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single();

    if (!membership || membership.role !== "LEADER") {
      return { error: "Only the team leader can invite members." };
    }

    // Check if the user exists in profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (profileError || !profile) {
      return { error: "This user is not registered on Collably yet." };
    }

    const admin = createAdminSupabase();

    // Check the team belongs to a course and the invitee is enrolled
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

        return {
          error: `This user is not enrolled in "${course?.name ?? "this course"}". They must join the course first.`,
        };
      }
    }

    const { error: insertError } = await admin
      .from("team_members")
      .insert({ team_id: teamId, user_id: profile.id, role: "MEMBER" });

    // 23505 = unique_violation (already a member) — treat gracefully
    if (insertError && insertError.code === "23505") {
      return { error: "This user is already a member of the team." };
    }
    if (insertError) {
      return { error: "Failed to add member. Please try again." };
    }

    // Send notification
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
    return { success: true };
  } catch (err) {
    console.error("[addMemberByEmail]", err);
    return { error: "Something went wrong. Please try again." };
  }
}