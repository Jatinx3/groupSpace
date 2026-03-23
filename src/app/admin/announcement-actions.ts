"use server";

import { z } from "zod";
import { createAdminSupabase, createServerSupabase } from "@/src/lib/supabase-server";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const userSupabase = await createServerSupabase();
  const { data: { user } } = await userSupabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await userSupabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") throw new Error("Forbidden: requires admin role");
}

const AnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  content: z.string().min(1, "Content is required"),
  audience_type: z.enum(["all", "students", "professors", "course", "team"]),
  audience_id: z.string().nullable().optional(),
  priority: z.enum(["normal", "important", "urgent"]),
  display_type: z.enum(["banner", "popup", "feed"]),
});

export async function createAnnouncement(data: any) {
  await requireAdmin();
  const parsedData = AnnouncementSchema.parse(data);
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("announcements").insert([parsedData]);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function deleteAnnouncement(id: string) {
  await requireAdmin();
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function toggleAnnouncementStatus(id: string, currentStatus: string) {
  await requireAdmin();
  const supabase = createAdminSupabase();
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  const { error } = await supabase.from("announcements").update({ status: newStatus }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
