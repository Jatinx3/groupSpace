"use server";

import { createServerSupabase } from "../../../lib/supabase-server";
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

  const { error } = await supabase
    .from("team_members")
    .insert({
      team_id: teamId,
      user_id: profile.id,
      role: "MEMBER",
    });

  if (error && error.code !== "23505") throw error;

  revalidatePath(`/student/teams/${teamId}`);
}