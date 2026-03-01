import { NextResponse } from "next/server";
import { createServerSupabase } from "../../../../lib/supabase-server";

async function getProfessor() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "professor") return null;
  return { supabase, user };
}

function randomCode(len = 8) {
  return Math.random().toString(36).toUpperCase().slice(2, 2 + len);
}

export async function POST(request: Request) {
  const ctx = await getProfessor();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, user } = ctx;

  const body = await request.json();
  const name = (body.name as string | undefined)?.trim();
  if (!name) return NextResponse.json({ error: "Course name required" }, { status: 400 });

  const { data, error } = await supabase
    .from("courses")
    .insert({ name, professor_id: user.id, invite_code: randomCode() })
    .select("id, name, invite_code")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const ctx = await getProfessor();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, user } = ctx;

  const body = await request.json();
  const { courseId, name } = body as { courseId: string; name: string };
  if (!courseId || !name?.trim()) return NextResponse.json({ error: "courseId and name required" }, { status: 400 });

  const { error } = await supabase
    .from("courses")
    .update({ name: name.trim() })
    .eq("id", courseId)
    .eq("professor_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const ctx = await getProfessor();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, user } = ctx;

  const body = await request.json();
  const { courseId } = body as { courseId: string };
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId)
    .eq("professor_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
