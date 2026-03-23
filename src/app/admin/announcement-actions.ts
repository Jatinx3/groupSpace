"use server";

import { z } from "zod";
import { createAdminSupabase } from "@/src/lib/supabase-server";
import { revalidatePath } from "next/cache";

const AnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  content: z.string().min(1, "Content is required"),
  audience_type: z.enum(["all", "students", "professors", "course", "team"]),
  audience_id: z.string().nullable().optional(),
  priority: z.enum(["normal", "important", "urgent"]),
  display_type: z.enum(["banner", "popup", "feed"]),
});

export async function createAnnouncement(data: any) {
  const parsedData = AnnouncementSchema.parse(data);
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("announcements").insert([parsedData]);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function deleteAnnouncement(id: string) {
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function toggleAnnouncementStatus(id: string, currentStatus: string) {
  const supabase = createAdminSupabase();
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  const { error } = await supabase.from("announcements").update({ status: newStatus }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
