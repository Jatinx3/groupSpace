"use server";

import { createAdminSupabase } from "@/src/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function createAnnouncement(data: {
  title: string;
  content: string;
  audience_type: string;
  audience_id?: string | null;
  priority: string;
  display_type: string;
  is_dismissible?: boolean;
  is_sticky?: boolean;
  expires_at?: string | null;
}) {
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("announcements").insert([data]);
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
