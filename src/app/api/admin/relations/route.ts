import { NextResponse } from "next/server";
import { createAdminSupabase, createServerSupabase } from "@/src/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  if (!type || !id) return NextResponse.json({ error: "Missing type or id" }, { status: 400 });

  const userSupabase = await createServerSupabase();
  const { data: { user } } = await userSupabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await userSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createAdminSupabase();

  try {
    if (type === "professors" || type === "students") {
       const { data: cMem } = await supabase.from("course_members").select("*, courses(name)").eq("user_id", id);
       const { data: tMem } = await supabase.from("team_members").select("*, teams(name)").eq("user_id", id);
       return NextResponse.json({ courses: cMem || [], teams: tMem || [] });
    } else if (type === "courses") {
       const { data: teams } = await supabase.from("teams").select("*").eq("course_id", id);
       const { data: studs } = await supabase.from("course_members").select("*, profiles!user_id(first_name, last_name, email)").eq("course_id", id);
       return NextResponse.json({ teams: teams || [], students: studs || [] });
    } else if (type === "teams") {
       const { data: studs } = await supabase.from("team_members").select("*, profiles!user_id(first_name, last_name, email)").eq("team_id", id);
       const { data: tks } = await supabase.from("tasks").select("*").eq("team_id", id);
       return NextResponse.json({ students: studs || [], tasks: tks || [] });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
