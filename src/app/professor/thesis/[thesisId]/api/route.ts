import { NextResponse } from "next/server";
import { createServerSupabase } from "../../../../../lib/supabase-server";

async function getProfessorThesis(thesisId: string) {
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

  const { data: thesis } = await supabase
    .from("thesis_projects")
    .select("id, supervisor_id")
    .eq("id", thesisId)
    .eq("supervisor_id", user.id)
    .single();

  if (!thesis) return null;

  return { supabase, user, thesis };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ thesisId: string }> }
) {
  const { thesisId } = await params;
  const ctx = await getProfessorThesis(thesisId);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const updates: Record<string, any> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.deadline !== undefined) updates.deadline = body.deadline || null;
  if (body.status !== undefined) updates.status = body.status;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { error } = await ctx.supabase
    .from("thesis_projects")
    .update(updates)
    .eq("id", thesisId);

  if (error) {
    console.error("Update thesis error:", error);
    return NextResponse.json({ error: "Could not update thesis" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ thesisId: string }> }
) {
  const { thesisId } = await params;
  const ctx = await getProfessorThesis(thesisId);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await ctx.supabase
    .from("thesis_projects")
    .delete()
    .eq("id", thesisId);

  if (error) {
    console.error("Delete thesis error:", error);
    return NextResponse.json({ error: "Could not delete thesis" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
