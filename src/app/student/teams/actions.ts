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
    .select("storage_path, team_id")
    .eq("id", fileId)
    .single();

  if (!file) return;

  // Delete all version files from storage
  const { data: versions } = await supabase
    .from("file_versions")
    .select("file_url")
    .eq("file_id", fileId);

  if (versions && versions.length > 0) {
    const paths = versions.map((v) => v.file_url).filter(Boolean);
    if (paths.length > 0) {
      await supabase.storage.from("team-files").remove(paths);
    }
  }

  // Also remove the original storage_path if it exists and isn't in versions
  if (file.storage_path) {
    await supabase.storage.from("team-files").remove([file.storage_path]);
  }

  // Cascade delete handles file_versions rows
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
/* UPLOAD FILE (VERSION-AWARE)  */
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

  // Check if a file with the same name already exists in this folder
  const { data: existingFile } = await supabase
    .from("project_files")
    .select("id, current_version")
    .eq("team_id", teamId)
    .eq("file_name", file.name)
    .eq("folder_id", folderId || "")
    .maybeSingle();

  if (existingFile) {
    // Create new version for existing file
    const pushForm = new FormData();
    pushForm.append("teamId", teamId);
    pushForm.append("file", file);
    pushForm.append("existingFileId", existingFile.id);
    pushForm.append("changeMessage", "Updated file");
    if (folderId) pushForm.append("folderId", folderId);
    await pushFileUpdate(pushForm);
    return;
  }

  // New file — create project_files entry + v1
  const fileId = randomUUID();
  const filePath = `${teamId}/${fileId}/1_${file.name}`;

  // Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from("team-files")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    throw uploadError;
  }

  // Insert project_files record
  const { data: newFile, error: dbError } = await supabase
    .from("project_files")
    .insert({
      id: fileId,
      team_id: teamId,
      file_name: file.name,
      file_size: file.size,
      uploaded_by: user.id,
      storage_path: filePath,
      folder_id: folderId || null,
      current_version: 1,
      is_versioned: true,
    })
    .select("id")
    .single();

  if (dbError || !newFile) {
    console.error("DB insert error:", dbError);
    throw dbError;
  }

  // Insert v1 into file_versions
  const { data: version, error: versionError } = await supabase
    .from("file_versions")
    .insert({
      file_id: newFile.id,
      version_number: 1,
      file_url: filePath,
      file_size: file.size,
      uploaded_by: user.id,
      change_message: "Initial upload",
    })
    .select("id")
    .single();

  if (versionError) {
    console.error("Version insert error:", versionError);
    throw versionError;
  }

  // Update latest_version_id
  if (version) {
    await supabase
      .from("project_files")
      .update({ latest_version_id: version.id })
      .eq("id", newFile.id);
  }

  revalidatePath(`/student/teams/${teamId}`);
}

/* ============================= */
/* UPLOAD FILE SIMPLE (ASSET)    */
/* ============================= */

export async function uploadFileSimple(formData: FormData) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const teamId = formData.get("teamId") as string;
  const file = formData.get("file") as File;

  if (!teamId || !file) {
    throw new Error("Missing teamId or file");
  }

  const fileId = randomUUID();
  const filePath = `${teamId}/assets/${fileId}_${file.name}`;

  // Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from("team-files")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    throw uploadError;
  }

  // Insert project_files record (no file_versions entry)
  const { error: dbError } = await supabase
    .from("project_files")
    .insert({
      id: fileId,
      team_id: teamId,
      file_name: file.name,
      file_size: file.size,
      uploaded_by: user.id,
      storage_path: filePath,
      is_versioned: false,
      current_version: 1,
    });

  if (dbError) {
    console.error("DB insert error:", dbError);
    throw dbError;
  }

  revalidatePath(`/student/teams/${teamId}`);
}

/* ============================= */
/* PUSH FILE UPDATE (NEW VERSION)*/
/* ============================= */

export async function pushFileUpdate(formData: FormData) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const teamId = formData.get("teamId") as string;
  const file = formData.get("file") as File;
  const changeMessage = (formData.get("changeMessage") as string) || "Updated file";
  const existingFileId = formData.get("existingFileId") as string | null;
  const folderId = formData.get("folderId") as string | null;

  if (!teamId || !file) {
    throw new Error("Missing teamId or file");
  }

  let fileId = existingFileId;
  let nextVersion = 1;

  if (fileId) {
    // Existing file — get current version
    const { data: existing } = await supabase
      .from("project_files")
      .select("current_version")
      .eq("id", fileId)
      .single();

    // Safety check: Get the absolute max version number from file_versions table
    const { data: maxVersionData } = await supabase
      .from("file_versions")
      .select("version_number")
      .eq("file_id", fileId)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const actualMax = maxVersionData?.version_number ?? 0;
    const dbCurrent = existing?.current_version ?? 0;
    
    nextVersion = Math.max(actualMax, dbCurrent) + 1;
  } else {
    // Check if a file with same name exists in this folder
    const folderFilter = folderId || null;
    let query = supabase
      .from("project_files")
      .select("id, current_version")
      .eq("team_id", teamId)
      .eq("file_name", file.name);

    if (folderFilter) {
      query = query.eq("folder_id", folderFilter);
    } else {
      query = query.is("folder_id", null);
    }

    const { data: match } = await query.maybeSingle();

    if (match) {
      fileId = match.id;
      
      // Safety check: Get the absolute max version number from file_versions table
      const { data: maxVersionData } = await supabase
        .from("file_versions")
        .select("version_number")
        .eq("file_id", fileId)
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      const actualMax = maxVersionData?.version_number ?? 0;
      const dbCurrent = match.current_version ?? 0;
      
      nextVersion = Math.max(actualMax, dbCurrent) + 1;
    } else {
      // Brand new file
      fileId = randomUUID();
      nextVersion = 1;

      const filePath = `${teamId}/${fileId}/1_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("team-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from("project_files")
        .insert({
          id: fileId,
          team_id: teamId,
          file_name: file.name,
          file_size: file.size,
          uploaded_by: user.id,
          storage_path: filePath,
          folder_id: folderId || null,
          current_version: 1,
          is_versioned: true,
        });

      if (dbError) throw dbError;

      const { data: v1, error: v1Error } = await supabase
        .from("file_versions")
        .insert({
          file_id: fileId,
          version_number: 1,
          file_url: filePath,
          file_size: file.size,
          uploaded_by: user.id,
          change_message: changeMessage,
        })
        .select("id")
        .single();

      if (v1Error) throw v1Error;

      if (v1) {
        await supabase
          .from("project_files")
          .update({ latest_version_id: v1.id })
          .eq("id", fileId);
      }

      revalidatePath(`/student/teams/${teamId}`);
      return;
    }
  }

  // Upload new version file
  const filePath = `${teamId}/${fileId}/${nextVersion}_${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("team-files")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Insert version record
  const { data: newVersion, error: versionError } = await supabase
    .from("file_versions")
    .insert({
      file_id: fileId,
      version_number: nextVersion,
      file_url: filePath,
      file_size: file.size,
      uploaded_by: user.id,
      change_message: changeMessage,
    })
    .select("id")
    .single();

  if (versionError) throw versionError;

  // Update project_files
  await supabase
    .from("project_files")
    .update({
      current_version: nextVersion,
      file_size: file.size,
      storage_path: filePath,
      latest_version_id: newVersion?.id ?? null,
      is_versioned: true,
    })
    .eq("id", fileId);

  revalidatePath(`/student/teams/${teamId}`);
}

/* ============================= */
/* GET FILE VERSIONS             */
/* ============================= */

export async function getFileVersions(fileId: string) {
  const supabase = await createServerSupabase();

  const { data: versions, error } = await supabase
    .from("file_versions")
    .select(`
      id,
      version_number,
      file_url,
      file_size,
      change_message,
      created_at,
      uploaded_by
    `)
    .eq("file_id", fileId)
    .order("version_number", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Resolve uploader names
  const uploaderIds = Array.from(
    new Set((versions ?? []).map((v) => v.uploaded_by).filter(Boolean))
  );

  let uploaderMap: Record<string, string> = {};

  if (uploaderIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", uploaderIds);

    (profiles ?? []).forEach((p: any) => {
      uploaderMap[p.id] = `${p.first_name} ${p.last_name}`.trim();
    });
  }

  return (versions ?? []).map((v) => ({
    id: v.id,
    versionNumber: v.version_number,
    fileUrl: v.file_url,
    fileSize: v.file_size,
    changeMessage: v.change_message,
    createdAt: v.created_at,
    uploadedBy: v.uploaded_by,
    uploaderName: uploaderMap[v.uploaded_by] ?? "Unknown",
  }));
}

/* ============================= */
/* RESTORE VERSION               */
/* ============================= */

export async function restoreVersion(formData: FormData) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const fileId = formData.get("fileId") as string;
  const versionId = formData.get("versionId") as string;

  if (!fileId || !versionId) throw new Error("Missing fileId or versionId");

  // Get the version to restore
  const { data: version } = await supabase
    .from("file_versions")
    .select("file_url, file_size, version_number")
    .eq("id", versionId)
    .single();

  if (!version) throw new Error("Version not found");

  // Get current file info
  const { data: file } = await supabase
    .from("project_files")
    .select("current_version, team_id")
    .eq("id", fileId)
    .single();

  if (!file) throw new Error("File not found");

  // Safety check: Get the absolute max version number from file_versions table
  const { data: maxVersionData } = await supabase
    .from("file_versions")
    .select("version_number")
    .eq("file_id", fileId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const actualMax = maxVersionData?.version_number ?? 0;
  const dbCurrent = file.current_version ?? 0;

  const nextVersion = Math.max(actualMax, dbCurrent) + 1;

  // Create a new version entry pointing to the restored version's file
  const { data: newVersion, error: insertError } = await supabase
    .from("file_versions")
    .insert({
      file_id: fileId,
      version_number: nextVersion,
      file_url: version.file_url,
      file_size: version.file_size,
      uploaded_by: user.id,
      change_message: `Restored from v${version.version_number}`,
    })
    .select("id")
    .single();

  if (insertError) throw insertError;

  // Update project_files
  await supabase
    .from("project_files")
    .update({
      current_version: nextVersion,
      storage_path: version.file_url,
      file_size: version.file_size,
      latest_version_id: newVersion?.id ?? null,
      is_versioned: true,
    })
    .eq("id", fileId);

  revalidatePath(`/student/teams/${file.team_id}`);
}

/* ============================= */
/* GET FILE CONTENT (FOR EDITOR) */
/* ============================= */

export async function getFileContent(fileId: string) {
  const supabase = await createServerSupabase();

  const { data: file } = await supabase
    .from("project_files")
    .select("storage_path, file_name")
    .eq("id", fileId)
    .single();

  if (!file || !file.storage_path) throw new Error("File not found");

  const { data, error } = await supabase.storage
    .from("team-files")
    .download(file.storage_path);

  if (error || !data) throw new Error("Could not download file");

  const text = await data.text();
  return { content: text, fileName: file.file_name };
}

/* ============================= */
/* SAVE FILE CONTENT (EDITOR)    */
/* ============================= */

export async function saveFileContent(formData: FormData) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const fileId = formData.get("fileId") as string;
  const content = formData.get("content") as string;
  const changeMessage = (formData.get("changeMessage") as string) || "Edited file";

  if (!fileId) throw new Error("Missing fileId");

  const { data: file } = await supabase
    .from("project_files")
    .select("file_name, team_id, current_version")
    .eq("id", fileId)
    .single();

  if (!file) throw new Error("File not found");

  // Safety check: Get the absolute max version number from file_versions table
  const { data: maxVersionData } = await supabase
    .from("file_versions")
    .select("version_number")
    .eq("file_id", fileId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const actualMax = maxVersionData?.version_number ?? 0;
  const dbCurrent = file.current_version ?? 0;

  const nextVersion = Math.max(actualMax, dbCurrent) + 1;
  const blob = new Blob([content ?? ""], { type: "text/plain" });
  const filePath = `${file.team_id}/${fileId}/${nextVersion}_${file.file_name}`;

  const { error: uploadError } = await supabase.storage
    .from("team-files")
    .upload(filePath, blob);

  if (uploadError) throw uploadError;

  const { data: newVersion, error: versionError } = await supabase
    .from("file_versions")
    .insert({
      file_id: fileId,
      version_number: nextVersion,
      file_url: filePath,
      file_size: blob.size,
      uploaded_by: user.id,
      change_message: changeMessage,
    })
    .select("id")
    .single();

  if (versionError) throw versionError;

  await supabase
    .from("project_files")
    .update({
      current_version: nextVersion,
      storage_path: filePath,
      file_size: blob.size,
      latest_version_id: newVersion?.id ?? null,
      is_versioned: true,
    })
    .eq("id", fileId);

  revalidatePath(`/student/teams/${file.team_id}`);
}

/* =============================
   CREATE EMPTY FILE (VERSIONED)
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

  const fileId = randomUUID();
  const filePath = `${teamId}/${fileId}/1_${fileName}`;

  // Create empty file blob
  const emptyFile = new File([""], fileName);

  const { error: uploadError } = await supabase.storage
    .from("team-files")
    .upload(filePath, emptyFile);

  if (uploadError) throw uploadError;

  const { data: newFile, error: dbError } = await supabase
    .from("project_files")
    .insert({
      id: fileId,
      team_id: teamId,
      file_name: fileName,
      file_size: 0,
      uploaded_by: user.id,
      storage_path: filePath,
      folder_id: folderId || null,
      current_version: 1,
      is_versioned: true,
    })
    .select("id")
    .single();

  if (dbError || !newFile) throw dbError;

  const { data: v1, error: versionError } = await supabase
    .from("file_versions")
    .insert({
      file_id: newFile.id,
      version_number: 1,
      file_url: filePath,
      file_size: 0,
      uploaded_by: user.id,
      change_message: "Created empty file",
    })
    .select("id")
    .single();

  if (versionError) throw versionError;

  if (v1) {
    await supabase
      .from("project_files")
      .update({ latest_version_id: v1.id })
      .eq("id", newFile.id);
  }
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