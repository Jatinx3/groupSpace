import { NextResponse } from "next/server";
import { createServerSupabase, createAdminSupabase } from "../../../../lib/supabase-server";

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

  const { data: profProfile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single();

  const profName = profProfile
    ? `${profProfile.first_name} ${profProfile.last_name}`.trim()
    : "Your professor";

  const admin = createAdminSupabase();
  const { error: notifError } = await admin.from("notifications").insert({
    user_id: student.id,
    type: "thesis",
    title: "Thesis Project Assigned",
    message: `${profName} assigned you a thesis project: "${title}"`,
    read: false,
  });

  if (notifError) {
    console.error("Notification insert error:", notifError);
  }

  return NextResponse.json({ ok: true });
}

