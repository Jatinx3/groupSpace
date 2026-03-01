import { NextResponse } from "next/server";
import { createServerSupabase } from "../../../../../lib/supabase-server";

async function getProfessorWithCourse(courseId: string) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: course } = await supabase
    .from("courses")
    .select("id, professor_id")
    .eq("id", courseId)
    .eq("professor_id", user.id)
    .single();
  if (!course) return null;
  return { supabase, user, course };
}

function randomCode(len = 8) {
  return Math.random().toString(36).toUpperCase().slice(2, 2 + len);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const ctx = await getProfessorWithCourse(courseId);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase } = ctx;

  const body = await request.json();

  if (body.action === "add-student") {
    const email = (body.email as string | undefined)?.trim().toLowerCase();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const { data: student } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("email", email)
      .single();

    if (!student || student.role !== "student") {
      return NextResponse.json({ error: "No student found with that email." }, { status: 404 });
    }

    const { error } = await supabase
      .from("course_members")
      .insert({ course_id: courseId, user_id: student.id });

    if (error && error.code !== "23505") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (body.action === "new-code") {
    const newCode = randomCode();
    const { error } = await supabase
      .from("courses")
      .update({ invite_code: newCode })
      .eq("id", courseId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ code: newCode });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
