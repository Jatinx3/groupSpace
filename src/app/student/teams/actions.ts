"use server";

import { createServerSupabase, createAdminSupabase } from "../../../lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";

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

  const teamId = randomUUID();
  const joinCode = crypto.randomUUID().slice(0, 8).toUpperCase();

  // 1️⃣ Insert team (no select)
  const { error: teamError } = await supabase
    .from("teams")
    .insert({
      id: teamId,
      name,
      course_id: courseId,
      join_code: joinCode,
    });

  if (teamError) throw teamError;

  // 2️⃣ Insert membership
  const { error: memberError } = await supabase
    .from("team_members")
    .insert({
      team_id: teamId,
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

    const { data: joinerProfile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    const joinerName = joinerProfile
      ? `${joinerProfile.first_name} ${joinerProfile.last_name}`.trim()
      : "Someone";

    const { data: teamDetails } = await supabase
      .from("teams")
      .select("name")
      .eq("id", team.id)
      .single();

    const { data: existingMembers } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("team_id", team.id)
      .neq("user_id", user.id);

    if (existingMembers && existingMembers.length > 0) {
      const admin = createAdminSupabase();
      const notifRows = existingMembers.map((m) => ({
        user_id: m.user_id,
        type: "team",
        title: "New Team Member",
        message: `${joinerName} joined your team "${teamDetails?.name ?? "your team"}"`,
        read: false,
      }));
      await admin.from("notifications").insert(notifRows);
    }
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

    // 3️⃣ Notify each assignee (skip the creator)
    const { data: creatorProfile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    const creatorName = creatorProfile
      ? `${creatorProfile.first_name} ${creatorProfile.last_name}`.trim()
      : "Someone";

    const notifRows = assignees
      .filter((uid) => uid !== user.id)
      .map((uid) => ({
        user_id: uid,
        type: "task",
        title: "Task Assigned",
        message: `${creatorName} assigned you to "${task.title}"`,
        read: false,
      }));

    if (notifRows.length > 0) {
      const admin = createAdminSupabase();
      await admin.from("notifications").insert(notifRows);
    }
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





/* ============================= */
/* CREATE FOLDER */
/* ============================= */

export async function createFolder(formData: FormData) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const teamId = formData.get("teamId") as string;
  const name = formData.get("name") as string;
  const parentId = formData.get("parentId") as string | null;

  if (!teamId || !name) {
    throw new Error("Missing teamId or folder name");
  }

  const { error } = await supabase.from("folders").insert({
    team_id: teamId,
    name,
    parent_id: parentId || null,
  });

  if (error) {
    console.error("Create folder error:", error);
    throw error;
  }
}

/* ============================= */
/* DELETE FOLDER */
/* ============================= */

export async function deleteFolder(formData: FormData) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const folderId = formData.get("folderId") as string;

  if (!folderId) {
    throw new Error("Missing folderId");
  }

  // Check for child folders
  const { data: childFolders } = await supabase
    .from("folders")
    .select("id")
    .eq("parent_id", folderId);

  if (childFolders && childFolders.length > 0) {
    throw new Error("Folder contains subfolders");
  }

  // Check for files inside folder
  const { data: childFiles } = await supabase
    .from("project_files")
    .select("id")
    .eq("folder_id", folderId);

  if (childFiles && childFiles.length > 0) {
    throw new Error("Folder contains files");
  }

  const { error } = await supabase
    .from("folders")
    .delete()
    .eq("id", folderId);

  if (error) {
    console.error("Delete folder error:", error);
    throw error;
  }
}


/* ============================= */
/* UPLOAD FILE (UNIVERSAL) */
/* ============================= */

export async function uploadFile(formData: FormData) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const teamId = formData.get("teamId") as string;
  const file = formData.get("file") as File;
  const folderId = formData.get("folderId") as string | null;

  if (!teamId || !file) {
    throw new Error("Missing teamId or file");
  }

  // If no folderId, upload to root
  const folderSegment = folderId ?? "root";

  const filePath = `${teamId}/${folderSegment}/${Date.now()}-${file.name}`;

  // Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from("team-files")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    throw uploadError;
  }

  // Insert DB record
  const { error: dbError } = await supabase
    .from("project_files")
    .insert({
      team_id: teamId,
      file_name: file.name,
      file_size: file.size,
      uploaded_by: user.id,
      storage_path: filePath,
      folder_id: folderId || null,
    });

  if (dbError) {
    console.error("DB insert error:", dbError);
    throw dbError;
  }
}

/* =============================
   CREATE EMPTY FILE
============================= */

export async function createEmptyFile(formData: FormData) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const teamId = formData.get("teamId") as string;
  const fileName = formData.get("fileName") as string;
  const folderId = formData.get("folderId") as string | null;

  if (!teamId || !fileName) {
    throw new Error("Missing teamId or fileName");
  }

  const folderSegment = folderId ?? "root";

  const filePath = `${teamId}/${folderSegment}/${Date.now()}-${fileName}`;

  // Create empty file blob
  const emptyFile = new File([""], fileName);

  const { error: uploadError } = await supabase.storage
    .from("team-files")
    .upload(filePath, emptyFile);

  if (uploadError) throw uploadError;

  const { error: dbError } = await supabase
    .from("project_files")
    .insert({
      team_id: teamId,
      file_name: fileName,
      file_size: 0,
      uploaded_by: user.id,
      storage_path: filePath,
      folder_id: folderId || null,
    });

  if (dbError) throw dbError;
}




export async function joinCourseByCode(formData: FormData) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const code = formData.get("code")?.toString().trim();

  if (!code) {
    throw new Error("Invite code is required");
  }

  /* ======================
     Find Course By Code
  ====================== */

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("invite_code", code)
    .single();

  if (courseError || !course) {
    throw new Error("Invalid invite code");
  }

  /* ======================
     Insert Membership
  ====================== */

  const { error: insertError } = await supabase
    .from("course_members")
    .insert({
      user_id: user.id,
      course_id: course.id,
    });

  // Ignore duplicate errors safely
  if (insertError && insertError.code !== "23505") {
    throw insertError;
  }

  revalidatePath("/student/courses");
}

/* =========================
   SEND CHAT NOTIFICATIONS
========================= */
export async function sendChatNotifications(
  recipientIds: string[],
  senderName: string,
  preview: string
) {
  if (recipientIds.length === 0) return;
  const admin = createAdminSupabase();
  const rows = recipientIds.map((uid) => ({
    user_id: uid,
    type: "chat",
    title: "New Chat Message",
    message: `${senderName}: ${preview}`,
    read: false,
  }));
  await admin.from("notifications").insert(rows);
}