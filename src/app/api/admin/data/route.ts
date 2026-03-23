import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/src/lib/supabase-server";

export async function GET() {
  const supabase = createAdminSupabase();

  try {
    const [
      { data: profs },
      { data: studs },
      { data: crs },
      { data: crsMem },
      { data: tms },
      { data: tmsMem },
      { data: tks },
      { data: notifs },
      { data: anns }
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("role", "professor"),
      supabase.from("profiles").select("*").eq("role", "student"),
      supabase.from("courses").select("*"),
      supabase.from("course_members").select("*"),
      supabase.from("teams").select("*"),
      supabase.from("team_members").select("*"),
      supabase.from("tasks").select("*"),
      supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("announcements").select("*").order("created_at", { ascending: false })
    ]);

    return NextResponse.json({
      profs: profs || [],
      studs: studs || [],
      crs: crs || [],
      crsMem: crsMem || [],
      tms: tms || [],
      tmsMem: tmsMem || [],
      tks: tks || [],
      notifs: notifs || [],
      anns: anns || []
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
