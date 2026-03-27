import { NextResponse } from "next/server";
import { createServerSupabase } from "../../../../lib/supabase-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createServerSupabase();

  // 1️⃣ Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // 2️⃣ Fetch file row with latest version
  const { data: file, error } = await supabase
    .from("project_files")
    .select("file_name, storage_path, latest_version_id")
    .eq("id", id)
    .single();

  if (error || !file) {
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 }
    );
  }

  // 3️⃣ Get the storage path — prefer latest version, fallback to storage_path
  let storagePath = file.storage_path;

  if (file.latest_version_id) {
    const { data: version } = await supabase
      .from("file_versions")
      .select("file_url")
      .eq("id", file.latest_version_id)
      .single();

    if (version?.file_url) {
      storagePath = version.file_url;
    }
  }

  if (!storagePath) {
    return NextResponse.json(
      { error: "No file path found" },
      { status: 404 }
    );
  }

  // 4️⃣ Generate signed URL and PROXY the content (do NOT redirect)
  // Reason: a client-side `fetch()` following a cross-origin redirect to Supabase
  // gets an opaque response — reading `.text()` or `.blob()` returns empty.
  const { data: signedData, error: signedError } =
    await supabase.storage
      .from("team-files")
      .createSignedUrl(storagePath, 60);

  if (signedError || !signedData) {
    return NextResponse.json(
      { error: "Could not generate download URL" },
      { status: 500 }
    );
  }

  // Fetch the file server-side to avoid CORS restrictions
  const upstream = await fetch(signedData.signedUrl);
  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Failed to fetch file from storage" },
      { status: 502 }
    );
  }

  const contentType =
    upstream.headers.get("content-type") || "application/octet-stream";
  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${file.file_name}"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}