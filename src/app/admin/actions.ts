"use server";

import { createAdminSupabase, createServerSupabase } from "@/src/lib/supabase-server";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const userSupabase = await createServerSupabase();
  const { data: { user } } = await userSupabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await userSupabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") throw new Error("Forbidden: requires admin role");
}

export async function updateUser(id: string, data: any) {
  await requireAdmin();
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("profiles").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function deleteUser(id: string) {
  await requireAdmin();
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function updateCourse(id: string, data: any) {
  await requireAdmin();
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("courses").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function deleteCourse(id: string) {
  await requireAdmin();
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function updateTeam(id: string, data: any) {
  await requireAdmin();
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("teams").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function deleteTeam(id: string) {
  await requireAdmin();
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function updateTask(id: string, data: any) {
  await requireAdmin();
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("tasks").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function deleteTask(id: string) {
  await requireAdmin();
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function removeUserFromTeam(teamId: string, userId: string) {
  await requireAdmin();
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("team_members").delete().eq("team_id", teamId).eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function removeUserFromCourse(courseId: string, userId: string) {
  await requireAdmin();
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("course_members").delete().eq("course_id", courseId).eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
