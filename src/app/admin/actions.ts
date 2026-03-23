"use server";

import { createAdminSupabase } from "@/src/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function updateUser(id: string, data: any) {
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("profiles").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function deleteUser(id: string) {
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function updateCourse(id: string, data: any) {
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("courses").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function deleteCourse(id: string) {
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function updateTeam(id: string, data: any) {
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("teams").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function deleteTeam(id: string) {
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function updateTask(id: string, data: any) {
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("tasks").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function deleteTask(id: string) {
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function removeUserFromTeam(teamId: string, userId: string) {
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("team_members").delete().eq("team_id", teamId).eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function removeUserFromCourse(courseId: string, userId: string) {
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("course_members").delete().eq("course_id", courseId).eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
