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

  const formData = await request.formData();
  const milestoneId = formData.get("milestoneId") as string | null;
  const file = formData.get("file") as File | null;

  if (!milestoneId || !file) {
    return NextResponse.json(
      { error: "Missing milestone or file" },
      { status: 400 }
    );
  }

  const { data: milestone } = await supabase
    .from("thesis_milestones")
    .select("thesis_id")
    .eq("id", milestoneId)
    .single();

  if (!milestone) {
    return NextResponse.json(
      { error: "Milestone not found" },
      { status: 404 }
    );
  }

  const { data: thesis } = await supabase
    .from("thesis_projects")
    .select("id, student_id, supervisor_id")
    .eq("id", milestone.thesis_id)
    .single();

  if (!thesis) {
    return NextResponse.json(
      { error: "Thesis not found" },
      { status: 404 }
    );
  }

  if (user.id !== thesis.student_id && user.id !== thesis.supervisor_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: existingSubmissions } = await supabase
    .from("thesis_submissions")
    .select("version_number")
    .eq("milestone_id", milestoneId)
    .order("version_number", { ascending: false })
    .limit(1);

  const nextVersion =
    existingSubmissions && existingSubmissions.length > 0
      ? existingSubmissions[0].version_number + 1
      : 1;

  const path = `thesis/${thesis.id}/${milestoneId}/${Date.now()}-${
    file.name
  }`;

  const { error: uploadError } = await supabase.storage
    .from("thesis-files")
    .upload(path, file);

  if (uploadError) {
    console.error("Thesis upload error:", uploadError);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("thesis-files").getPublicUrl(path);

  const { error: insertError } = await supabase
    .from("thesis_submissions")
    .insert({
      milestone_id: milestoneId,
      version_number: nextVersion,
      file_name: file.name,
      file_url: publicUrl,
      uploaded_by: user.id,
    });

  if (insertError) {
    console.error("Thesis submission insert error:", insertError);
    return NextResponse.json(
      { error: "Could not save submission" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

