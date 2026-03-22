import { NextResponse } from "next/server";
import { createServerSupabase } from "../../../../lib/supabase-server";

export async function POST(request: Request) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const thesisId = formData.get("thesisId") as string | null;
  const file = formData.get("file") as File | null;
  const studentNote = (formData.get("studentNote") as string | null) ?? null;

  if (!thesisId || !file) {
    return NextResponse.json({ error: "Missing thesis ID or file" }, { status: 400 });
  }

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Only PDF or DOCX files are allowed" }, { status: 400 });
  }

  const { data: thesis } = await supabase
    .from("thesis_projects")
    .select("id, student_id")
    .eq("id", thesisId)
    .eq("student_id", user.id)
    .single();

  if (!thesis) {
    return NextResponse.json({ error: "Thesis not found or not your thesis" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("thesis_drafts")
    .select("version_number")
    .eq("thesis_id", thesisId)
    .order("version_number", { ascending: false })
    .limit(1);

  const nextVersion =
    existing && existing.length > 0 ? existing[0].version_number + 1 : 1;

  const filePath = `${thesisId}/${Date.now()}-v${nextVersion}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("thesis-drafts")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Draft upload error:", uploadError);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("thesis-drafts").getPublicUrl(filePath);

  const { error: insertError } = await supabase.from("thesis_drafts").insert({
    thesis_id: thesisId,
    uploaded_by: user.id,
    version_number: nextVersion,
    file_path: filePath,
    file_url: publicUrl,
    file_name: file.name,
    student_note: studentNote?.trim() || null,
  });

  if (insertError) {
    console.error("Draft insert error:", insertError);
    return NextResponse.json({ error: "Could not save draft record" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, version: nextVersion });
}
