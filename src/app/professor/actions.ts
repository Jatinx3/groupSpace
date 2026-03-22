"use server";

import { createServerSupabase, createAdminSupabase } from "../../lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function profAddMemberByEmail(teamId: string, email: string) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "professor") {
    throw new Error("Unauthorized");
  }

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .single();

  if (!targetProfile) throw new Error("No user found with that email");

  const { data: existing } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", targetProfile.id)
    .single();

  if (existing) throw new Error("User is already a member");

  const admin = createAdminSupabase();

  const { error } = await admin.from("team_members").insert({
    team_id: teamId,
    user_id: targetProfile.id,
    role: "MEMBER",
  });

  if (error && error.code !== "23505") throw error;

  const { data: team } = await supabase
    .from("teams")
    .select("name")
    .eq("id", teamId)
    .single();

  const { data: profProfile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single();

  const profName = profProfile
    ? `${profProfile.first_name} ${profProfile.last_name}`.trim()
    : "Your professor";

  await admin.from("notifications").insert({
    user_id: targetProfile.id,
    type: "team",
    title: "Added to Team",
    message: `${profName} added you to the team "${team?.name ?? "a team"}"`,
    read: false,
  });

  revalidatePath(`/professor/courses`);
}
