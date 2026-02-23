"use server";

import { createServerSupabase } from "../../../lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/* =========================
   CREATE TEAM
========================= */
export async function createTeam(formData: FormData) {
  const supabase = await createServerSupabase();

  const name = formData.get("name") as string;
  const courseId = formData.get("courseId") as string;

  if (!name || !courseId) {
    throw new Error("Missing team name or course");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

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

  if (error || !team) throw error;

  const { error: memberError } = await supabase
    .from("team_members")
    .insert({
      team_id: team.id,
      user_id: user.id,
      role: "LEADER",
    });

  if (memberError) throw memberError;

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

  if (!user) throw new Error("Not authenticated");

  await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", user.id);

  revalidatePath("/student/teams");
}

/* =========================
   DELETE TEAM
========================= */
export async function deleteTeam(teamId: string) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: membership, error } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single();

  if (error || !membership || membership.role !== "LEADER") {
    throw new Error("Not authorized to delete this team");
  }

  const { error: deleteError } = await supabase
    .from("teams")
    .delete()
    .eq("id", teamId);

  if (deleteError) throw deleteError;

  redirect("/student/teams");
}

/* =========================
   JOIN TEAM BY CODE
========================= */
export async function joinTeamByCode(formData: FormData) {
  const supabase = await createServerSupabase();

  const rawCode = formData.get("code") as string;
  const code = rawCode?.trim().toUpperCase();

  if (!code) throw new Error("Join code is required");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id")
    .eq("join_code", code)
    .single();

  if (teamError || !team) {
    throw new Error("Invalid team code");
  }

  const { data: existing } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", team.id)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    const { error: insertError } = await supabase
      .from("team_members")
      .insert({
        team_id: team.id,
        user_id: user.id,
        role: "MEMBER",
      });

    if (insertError) throw insertError;
  }

  revalidatePath("/student/teams");
}

/* =========================
   CREATE TASK (WITH MULTI ASSIGNEES)
========================= */
export async function createTask(formData: FormData) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const teamId = formData.get("teamId") as string;
  const assigneesRaw = formData.get("assignees") as string;

  if (!teamId) throw new Error("Missing team ID");

  const assignees: string[] = assigneesRaw
    ? JSON.parse(assigneesRaw)
    : [];

  // 1️⃣ Create task
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .insert({
      team_id: teamId,
      title: formData.get("title"),
      description: formData.get("description"),
      status: formData.get("status"),
      priority: formData.get("priority"),
      due_date: formData.get("due_date"),
    })
    .select()
    .single();

  if (taskError || !task) throw taskError;

  // 2️⃣ Insert assignees (if any)
  if (assignees.length > 0) {
    const rows = assignees.map((userId) => ({
      task_id: task.id,
      user_id: userId,
    }));

    const { error: assignError } = await supabase
      .from("task_assignees")
      .insert(rows);

    if (assignError) throw assignError;
  }

  revalidatePath(`/student/teams/${teamId}`);
}

/* =========================
   UPDATE TASK (REPLACE ASSIGNEES)
========================= */
export async function updateTask(formData: FormData) {
  const supabase = await createServerSupabase();

  const taskId = formData.get("taskId") as string;
  const teamId = formData.get("teamId") as string;
  const assigneesRaw = formData.get("assignees") as string;

  if (!taskId || !teamId) {
    throw new Error("Missing task or team ID");
  }

  const assignees: string[] = assigneesRaw
    ? JSON.parse(assigneesRaw)
    : [];

  // 1️⃣ Update task
  const { error: updateError } = await supabase
    .from("tasks")
    .update({
      title: formData.get("title"),
      description: formData.get("description"),
      status: formData.get("status"),
      priority: formData.get("priority"),
      due_date: formData.get("due_date"),
    })
    .eq("id", taskId);

  if (updateError) throw updateError;

  // 2️⃣ Remove old assignees
  await supabase
    .from("task_assignees")
    .delete()
    .eq("task_id", taskId);

  // 3️⃣ Insert new assignees
  if (assignees.length > 0) {
    const rows = assignees.map((userId) => ({
      task_id: taskId,
      user_id: userId,
    }));

    const { error: assignError } = await supabase
      .from("task_assignees")
      .insert(rows);

    if (assignError) throw assignError;
  }

  revalidatePath(`/student/teams/${teamId}`);
}

/* =========================
   DELETE TASK
========================= */
export async function deleteTask(formData: FormData) {
  const supabase = await createServerSupabase();

  const taskId = formData.get("taskId") as string;
  const teamId = formData.get("teamId") as string;

  if (!taskId || !teamId) {
    throw new Error("Missing task or team ID");
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) throw error;

  revalidatePath(`/student/teams/${teamId}`);
}

export async function uploadFile(formData: FormData) {
  const supabase = await createServerSupabase();

  const file = formData.get("file") as File | null;
  const teamId = formData.get("teamId") as string | null;

  if (!file || !teamId) {
    throw new Error("Missing file or team ID");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // ✅ Convert file properly
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filePath = `${teamId}/${crypto.randomUUID()}-${file.name}`;

  // ✅ Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("team-files")
    .upload(filePath, buffer, {
      contentType: file.type,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    throw uploadError;
  }

  // ✅ Insert metadata into DB
  const { error: dbError } = await supabase
    .from("project_files")
    .insert({
      team_id: teamId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      uploaded_by: user.id,
    });

  if (dbError) {
    console.error("DB insert error:", dbError);
    throw dbError;
  }

  revalidatePath(`/student/teams/${teamId}`);
}

export async function deleteFile(formData: FormData) {
  const supabase = await createServerSupabase();

  const fileId = formData.get("fileId") as string;

  const { data: file } = await supabase
    .from("project_files")
    .select("file_path, team_id")
    .eq("id", fileId)
    .single();

  if (!file) return;

  await supabase.storage
    .from("team-files")
    .remove([file.file_path]);

  await supabase
    .from("project_files")
    .delete()
    .eq("id", fileId);

  revalidatePath(`/student/teams/${file.team_id}`);
}