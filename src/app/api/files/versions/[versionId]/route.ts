import { NextResponse } from "next/server";
import { createServerSupabase } from "../../../../../lib/supabase-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const { versionId } = await params;

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

  // 2️⃣ Fetch version row
  const { data: version, error } = await supabase
    .from("file_versions")
    .select("file_url, file_id")
    .eq("id", versionId)
    .single();

  if (error || !version) {
    return NextResponse.json(
      { error: "Version not found" },
      { status: 404 }
    );
  }

  // 3️⃣ Generate signed URL
  const { data: signedData, error: signedError } =
    await supabase.storage
      .from("team-files")
      .createSignedUrl(version.file_url, 60);

  if (signedError || !signedData) {
    return NextResponse.json(
      { error: "Could not generate download URL" },
      { status: 500 }
    );
  }

  // 4️⃣ Redirect to actual file
  return NextResponse.redirect(signedData.signedUrl);
}
