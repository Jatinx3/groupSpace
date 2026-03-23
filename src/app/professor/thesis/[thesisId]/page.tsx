import { notFound } from "next/navigation";
import { createServerSupabase } from "../../../../lib/supabase-server";
import SupervisorThesisDetailClient from "../../../../components/thesis/SupervisorThesisDetailClient";

export default async function ProfessorThesisDetailPage({
  params,
}: {
  params: Promise<{ thesisId: string }>; // Next 16
}) {
  const { thesisId } = await params;

  const supabase = await createServerSupabase();

  // 🔐 Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // 👤 Profile check (must be professor)
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
        last_name,
        email
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

  if (!thesis) {
    notFound();
  }

  // 🔄 Normalize thesis relations (Supabase returns object or array depending on version)
  const toSingle = (val: any) => {
    if (!val) return null;
    return Array.isArray(val) ? (val[0] ?? null) : val;
  };
  const normalizedThesis = {
    ...thesis,
    student: toSingle(thesis.student),
    supervisor: toSingle(thesis.supervisor),
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

  // 💬 Comments (JOIN profiles for both student & supervisor names)
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
        last_name,
        email
      )
      `
    )
    .eq("thesis_id", thesisId)
    .order("created_at", { ascending: true });

  // 🔄 Normalize comment author relation
  const normalizedComments =
    comments?.map((comment) => ({
      ...comment,
      author: toSingle(comment.author),
    })) ?? [];

  // 📄 Drafts
  const { data: drafts } = await supabase
    .from("thesis_drafts")
    .select("id, thesis_id, uploaded_by, version_number, file_path, file_url, file_name, uploaded_at, student_note")
    .eq("thesis_id", thesisId)
    .order("version_number", { ascending: false });

  // 📹 Meetings (gracefully fall back if table is missing)
  const { data: meetingsResponse, error: meetingsError } = await supabase
    .from("thesis_meetings")
    .select("id, thesis_id, requester_id, professor_id, meeting_date, meeting_time, agenda, message, status, proposed_date, proposed_time, created_at")
    .eq("thesis_id", thesisId)
    .order("meeting_date", { ascending: true });
    
  let meetings = meetingsResponse || [];
  if (meetingsError && meetingsError.code === "42P01") {
    // If the table hasn't been created yet, just act as if it's empty
    meetings = [];
  }

  return (
    <SupervisorThesisDetailClient
      supervisorName={profile.first_name}
      thesis={normalizedThesis}
      milestones={milestones ?? []}
      submissions={submissions ?? []}
      comments={normalizedComments}
      drafts={drafts ?? []}
      meetings={meetings}
    />
  );
}