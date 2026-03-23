-- Run this in Supabase SQL Editor

create table if not exists public.thesis_meetings (
  id uuid primary key default gen_random_uuid(),
  thesis_id uuid not null references public.thesis_projects(id) on delete cascade,
  requester_id uuid not null references public.profiles(id),
  professor_id uuid not null references public.profiles(id),
  meeting_date date not null,
  meeting_time text not null,
  agenda text not null,
  message text,
  status text not null default 'pending', -- pending | accepted | rejected | rescheduled
  proposed_date date,
  proposed_time text,
  meeting_link text,
  created_at timestamptz not null default now()
);

alter table public.thesis_meetings enable row level security;

drop policy if exists thesis_meetings_select_participants on public.thesis_meetings;
create policy thesis_meetings_select_participants
on public.thesis_meetings
for select
using (
  auth.uid() in (requester_id, professor_id) 
  OR auth.uid() in (select student_id from public.thesis_projects where id = thesis_id)
);

drop policy if exists thesis_meetings_insert_participants on public.thesis_meetings;
create policy thesis_meetings_insert_participants
on public.thesis_meetings
for insert
with check (
  auth.uid() = requester_id 
  OR auth.uid() in (select student_id from public.thesis_projects where id = thesis_id)
  OR auth.uid() in (select supervisor_id from public.thesis_projects where id = thesis_id)
);

drop policy if exists thesis_meetings_update_participants on public.thesis_meetings;
create policy thesis_meetings_update_participants
on public.thesis_meetings
for update
using (
  auth.uid() in (requester_id, professor_id)
  OR auth.uid() in (select student_id from public.thesis_projects where id = thesis_id)
)
with check (
  auth.uid() in (requester_id, professor_id)
  OR auth.uid() in (select student_id from public.thesis_projects where id = thesis_id)
);
