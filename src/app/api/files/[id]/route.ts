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

  // 2️⃣ Fetch file row
  const { data: file, error } = await supabase
    .from("project_files")
    .select("file_name, storage_path")
    .eq("id", id)
    .single();

  if (error || !file) {
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 }
    );
  }

  // 3️⃣ Generate signed URL
  const { data: signedData, error: signedError } =
    await supabase.storage
      .from("team-files")
      .createSignedUrl(file.storage_path, 60);

  if (signedError || !signedData) {
    return NextResponse.json(
      { error: "Could not generate download URL" },
      { status: 500 }
    );
  }

  // 4️⃣ Redirect to actual file
  return NextResponse.redirect(signedData.signedUrl);
}