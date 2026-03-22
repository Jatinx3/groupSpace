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

  const body = await request.json();
  const thesisId = body.thesisId as string | undefined;
  const title = body.title as string | undefined;
  const description = (body.description as string | null) ?? null;
  const dueDate = (body.dueDate as string | null) ?? null;

  if (!thesisId || !title) {
    return NextResponse.json(
      { error: "Missing thesisId or title" },
      { status: 400 }
    );
  }

  const { data: thesis } = await supabase
    .from("thesis_projects")
    .select("supervisor_id, student_id")
    .eq("id", thesisId)
    .single();

  if (!thesis || thesis.supervisor_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("thesis_milestones").insert({
    thesis_id: thesisId,
    title,
    description,
    due_date: dueDate,
    status: "pending",
  });

  if (error) {
    console.error("Create thesis milestone error:", error);
    return NextResponse.json(
      { error: "Could not create milestone" },
      { status: 500 }
    );
  }

  if (thesis.student_id) {
    const admin = createAdminSupabase();
    await admin.from("notifications").insert({
      user_id: thesis.student_id,
      type: "milestone",
      title: "New Milestone Added",
      message: `Your supervisor added a new milestone: "${title}"`,
      read: false,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const milestoneId = body.milestoneId as string | undefined;
  const status = body.status as
    | "pending"
    | "submitted"
    | "approved"
    | "rejected"
    | undefined;
  const feedback = (body.feedback as string | null) ?? null;

  if (!milestoneId || !status) {
    return NextResponse.json(
      { error: "Missing milestoneId or status" },
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
    .select("supervisor_id, student_id")
    .eq("id", milestone.thesis_id)
    .single();

  if (!thesis || thesis.supervisor_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("thesis_milestones")
    .update({
      status,
      supervisor_feedback: feedback,
    })
    .eq("id", milestoneId);

  if (error) {
    console.error("Update thesis milestone error:", error);
    return NextResponse.json(
      { error: "Could not update milestone" },
      { status: 500 }
    );
  }

  if (thesis.student_id && (status === "approved" || status === "rejected")) {
    const statusLabel = status === "approved" ? "approved" : "rejected";
    const admin = createAdminSupabase();
    await admin.from("notifications").insert({
      user_id: thesis.student_id,
      type: "milestone",
      title: `Milestone ${status === "approved" ? "Approved" : "Rejected"}`,
      message: `Your supervisor ${statusLabel} the milestone${feedback ? `: "${feedback}"` : ""}`,
      read: false,
    });
  }

  return NextResponse.json({ ok: true });
}

