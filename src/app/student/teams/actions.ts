"use server";

import { createServerSupabase } from "../../../lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/* =========================
   CREATE TEAM
========================= */



  //create team
  export async function createTeam(formData: FormData) {
  const supabase = await createServerSupabase();

  const name = formData.get("name") as string;
  const courseId = formData.get("courseId") as string;

  if (!name || !courseId) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const joinCode = crypto.randomUUID().slice(0, 8).toUpperCase();

  const { data: team, error } = await supabase
    .from("teams")
    .insert({
      name,
      course_id: courseId,
      join_code: joinCode,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("team_members").insert({
    team_id: team.id,
    user_id: user.id,
    role: "LEADER",
  });

  revalidatePath("/student/teams");
}
  




/* =========================
   LEAVE TEAM
========================= */
export async function leaveTeam(teamId: string) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", user.id);

  revalidatePath("/student/teams");
}


/* =========================
   DELETE TEAM (OWNER ONLY)
========================= */
export async function deleteTeam(teamId: string) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // 🔐 Verify OWNER
  const { data: membership, error } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single();

  if (error || !membership || membership.role !== "LEADER") {
    throw new Error("Not authorized to delete this team");
  }

  // 🗑 Delete team (team_members cascade handles cleanup)
  const { error: deleteError } = await supabase
    .from("teams")
    .delete()
    .eq("id", teamId);

  if (deleteError) {
    console.error("Delete team error:", deleteError);
    throw deleteError;
  }

  redirect("/student/teams");
}


export async function joinTeamByCode(formData: FormData) {
  const supabase = await createServerSupabase();

  const code = (formData.get("code") as string)?.toUpperCase();
  if (!code) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("join_code", code)
    .single();

  if (!team) {
    throw new Error("Invalid code");
  }

  const { data: existing } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", team.id)
    .eq("user_id", user.id)
    .single();

  if (existing) return;

  await supabase.from("team_members").insert({
    team_id: team.id,
    user_id: user.id,
    role: "MEMBER",
  });

  revalidatePath("/student/teams");
}

export async function createTask(formData: FormData) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const teamId = formData.get("teamId") as string;

  const { error } = await supabase.from("tasks").insert({
    team_id: teamId,
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    due_date: formData.get("due_date"),
  });

  if (error) throw error;

  revalidatePath(`/student/teams/${teamId}`);
}

export async function updateTask(formData: FormData) {
  const supabase = await createServerSupabase();

  const taskId = formData.get("taskId") as string;
  const teamId = formData.get("teamId") as string;

  const { error } = await supabase
    .from("tasks")
    .update({
      title: formData.get("title"),
      description: formData.get("description"),
      status: formData.get("status"),
      priority: formData.get("priority"),
      due_date: formData.get("due_date"),
    })
    .eq("id", taskId);

  if (error) throw error;

  revalidatePath(`/student/teams/${teamId}`);
}