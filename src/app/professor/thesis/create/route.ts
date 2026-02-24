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

  if (!profile || profile.role !== "professor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const studentEmail = (body.studentEmail as string | undefined)?.trim();
  const title = (body.title as string | undefined)?.trim();
  const description =
    (body.description as string | undefined)?.trim() || null;
  const deadline = (body.deadline as string | undefined) || null;

  if (!studentEmail || !title) {
    return NextResponse.json(
      { error: "Student email and title are required." },
      { status: 400 }
    );
  }

  const { data: student } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("email", studentEmail)
    .single();

  if (!student || student.role !== "student") {
    return NextResponse.json(
      { error: "Student profile not found for that email." },
      { status: 404 }
    );
  }

  const { data: existing } = await supabase
    .from("thesis_projects")
    .select("id, status")
    .eq("student_id", student.id)
    .neq("status", "completed")
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: "This student already has an active thesis." },
      { status: 400 }
    );
  }

  const { error: insertError } = await supabase
    .from("thesis_projects")
    .insert({
      student_id: student.id,
      supervisor_id: user.id,
      title,
      description,
      deadline,
    });

  if (insertError) {
    console.error("Create thesis error:", insertError);
    return NextResponse.json(
      { error: "Could not create thesis project." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

