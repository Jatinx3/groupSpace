import { NextRequest } from "next/server";
import { createServerSupabase } from "../../../../../lib/supabase-server";
import archiver from "archiver";
import { PassThrough } from "stream";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await context.params;

  const supabase = await createServerSupabase();

  // 1️⃣ Fetch folders
  const { data: folders, error: folderError } = await supabase
    .from("folders")
    .select("*")
    .eq("team_id", teamId);

  if (folderError) {
    console.error(folderError);
    return new Response("Folder fetch error", { status: 500 });
  }

  // 2️⃣ Fetch files
  const { data: files, error: fileError } = await supabase
    .from("project_files")
    .select("*")
    .eq("team_id", teamId);

  if (fileError) {
    console.error(fileError);
    return new Response("File fetch error", { status: 500 });
  }

  if (!files || files.length === 0) {
    return new Response("No files found", { status: 404 });
  }

  // 3️⃣ Build folder map
  const folderMap: Record<string, any> = {};
  folders?.forEach((folder) => {
    folderMap[folder.id] = folder;
  });

  // 4️⃣ Helper to build full path recursively
  function buildFolderPath(folderId: string | null): string {
    if (!folderId) return "";

    const folder = folderMap[folderId];
    if (!folder) return "";

    const parentPath = buildFolderPath(folder.parent_id);
    return parentPath
      ? `${parentPath}/${folder.name}`
      : folder.name;
  }

  // 5️⃣ Create archive
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  const stream = new PassThrough();
  archive.pipe(stream);

  // 6️⃣ Append files with correct path
  for (const file of files) {
    if (!file.storage_path) continue;

    const { data } = await supabase.storage
      .from("team-files") // make sure bucket name matches
      .download(file.storage_path);

    if (!data) continue;

    const buffer = Buffer.from(await data.arrayBuffer());

    const folderPath = buildFolderPath(file.folder_id);

    const fullPath = folderPath
      ? `${folderPath}/${file.file_name}`
      : file.file_name;

    archive.append(buffer, {
      name: fullPath,
    });
  }

  await archive.finalize();

  return new Response(stream as any, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="project-${teamId}.zip"`,
    },
  });
}