import { notFound } from "next/navigation";
import { createServerSupabase } from "../../../../lib/supabase-server";
import SupervisorThesisDetailClient from "../../../../components/thesis/SupervisorThesisDetailClient";

export default async function ProfessorThesisDetailPage({
  params,
}: {
  params: Promise<{ thesisId: string }>;
}) {
  const { thesisId } = await params;

  const supabase = await createServerSupabase();

  // 🔐 Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  // 👤 Must be professor
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "professor") {
    notFound();
  }

  // 📘 Fetch thesis
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
      student:profiles!thesis_projects_student_id_fkey (
        id,
        first_name,
        last_name
      ),
      supervisor:profiles!thesis_projects_supervisor_id_fkey (
        id,
        first_name,
        last_name
      )
      `
    )
    .eq("id", thesisId)
    .eq("supervisor_id", user.id)
    .single();

  if (!thesis) notFound();

  // 🔥 THIS IS THE IMPORTANT FIX
  const normalizedThesis = {
    ...thesis,
    student: thesis.student?.[0] ?? null,
    supervisor: thesis.supervisor?.[0] ?? null,
  };

  // 📅 Milestones
  const { data: milestones } = await supabase
    .from("thesis_milestones")
    .select(
      "id, thesis_id, title, description, due_date, status, supervisor_feedback, created_at"
    )
    .eq("thesis_id", thesisId)
    .order("due_date", { ascending: true });

  // 📤 Submissions
  const milestoneIds = (milestones ?? []).map((m: any) => m.id);

  const { data: submissions } = await supabase
    .from("thesis_submissions")
    .select(
      "id, milestone_id, version_number, file_name, file_url, uploaded_by, created_at"
    )
    .in("milestone_id", milestoneIds.length ? milestoneIds : [""]);

  // 💬 Comments with author
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
    .eq("thesis_id", thesisId)
    .order("created_at", { ascending: true });

  const normalizedComments =
    comments?.map((c) => ({
      ...c,
      author: c.author?.[0] ?? null,
    })) ?? [];

  return (
    <SupervisorThesisDetailClient
      supervisorName={profile.first_name}
      thesis={normalizedThesis}   
      milestones={milestones ?? []}
      submissions={submissions ?? []}
      comments={normalizedComments}
      drafts={[]}
      meetings={[]}
    />
  );
}