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

  const body = await request.json();
  const thesisId = body.thesisId as string | undefined;
  const content = body.content as string | undefined;

  if (!thesisId || !content) {
    return NextResponse.json(
      { error: "Missing thesisId or content" },
      { status: 400 }
    );
  }

  const { data: thesis } = await supabase
    .from("thesis_projects")
    .select("student_id, supervisor_id")
    .eq("id", thesisId)
    .single();

  if (!thesis) {
    return NextResponse.json(
      { error: "Thesis not found" },
      { status: 404 }
    );
  }

  let authorRole: "student" | "supervisor";

  if (user.id === thesis.student_id) {
    authorRole = "student";
  } else if (user.id === thesis.supervisor_id) {
    authorRole = "supervisor";
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("thesis_comments").insert({
    thesis_id: thesisId,
    author_id: user.id,
    author_role: authorRole,
    content,
  });

  if (error) {
    console.error("Thesis comment insert error:", error);
    return NextResponse.json(
      { error: "Could not save comment" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

