import { notFound } from "next/navigation";
import { createServerSupabase } from "../../../lib/supabase-server";
import StudentThesisPageClient from "../../../components/thesis/StudentThesisPageClient";

export default async function StudentThesisPage({
  params,
}: {
  params: Promise<{}>; // Next 16 safe
}) {
  const supabase = await createServerSupabase();

  // 🔐 Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // 👤 Profile check (must be student)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    notFound();
  }

  // 📘 Fetch thesis for student
  const { data: thesis } = await supabase
    .from("thesis_projects")
    .select(
      `
      id,
      title,
      description,
      status,
      start_date,
      deadline,
      supervisor_id,
      supervisor:profiles!thesis_projects_supervisor_id_fkey (
        id,
        first_name,
        last_name
      )
      `
    )
    .eq("student_id", user.id)
    .single();

  // 🔄 Normalize supervisor relation
  const normalizedThesis = thesis
    ? {
        ...thesis,
        supervisor: thesis.supervisor?.[0] ?? null,
      }
    : null;

  // 📅 Milestones
  const { data: milestones } = await supabase
    .from("thesis_milestones")
    .select(
      "id, thesis_id, title, description, due_date, status, supervisor_feedback, created_at"
    )
    .eq("thesis_id", normalizedThesis?.id ?? "")
    .order("due_date", { ascending: true });

  // 📤 Submissions
  const milestoneIds = (milestones ?? []).map((m: any) => m.id);

  const { data: submissions } = await supabase
    .from("thesis_submissions")
    .select(
      "id, milestone_id, version_number, file_name, file_url, uploaded_by, created_at"
    )
    .in("milestone_id", milestoneIds.length ? milestoneIds : [""]);

  // 💬 Comments (JOIN author profile)
  const { data: comments } = await supabase
    .from("thesis_comments")
    .select(
      `
      id,
      thesis_id,
      author_id,
      author_role,
      content,
      created_at,
      author:profiles!thesis_comments_author_id_fkey (
        id,
        first_name,
        last_name
      )
      `
    )
    .eq("thesis_id", normalizedThesis?.id ?? "")
    .order("created_at", { ascending: true });

  // 🔄 Normalize comment author
  const normalizedComments =
    comments?.map((comment) => ({
      ...comment,
      author: comment.author?.[0] ?? null,
    })) ?? [];

  // 📄 Drafts
  const { data: drafts } = await supabase
    .from("thesis_drafts")
    .select("id, thesis_id, uploaded_by, version_number, file_path, file_url, file_name, uploaded_at, student_note")
    .eq("thesis_id", normalizedThesis?.id ?? "")
    .order("version_number", { ascending: false });

  return (
    <StudentThesisPageClient
      studentName={profile.first_name}
      thesis={normalizedThesis}
      milestones={milestones ?? []}
      submissions={submissions ?? []}
      comments={normalizedComments}
      drafts={drafts ?? []}
    />
  );
}