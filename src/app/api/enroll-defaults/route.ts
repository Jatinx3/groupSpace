import { NextResponse } from "next/server";
import { createServerSupabase, createAdminSupabase } from "../../../lib/supabase-server";

const DEFAULT_COURSE_NAMES = ["Hackathon", "Solo Project", "Team Project"];

export async function POST() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminSupabase();

  const { data: courses } = await admin
    .from("courses")
    .select("id, name")
    .in("name", DEFAULT_COURSE_NAMES);

  if (!courses || courses.length === 0) {
    return NextResponse.json({ error: "Default courses not found" }, { status: 404 });
  }

  const { data: existing } = await admin
    .from("course_members")
    .select("course_id")
    .eq("user_id", user.id)
    .in("course_id", courses.map((c) => c.id));

  const alreadyEnrolled = new Set(existing?.map((e) => e.course_id) ?? []);

  const toEnroll = courses
    .filter((c) => !alreadyEnrolled.has(c.id))
    .map((c) => ({ course_id: c.id, user_id: user.id }));

  if (toEnroll.length > 0) {
    await admin.from("course_members").insert(toEnroll);
  }

  return NextResponse.json({ ok: true });
}
