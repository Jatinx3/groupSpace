This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open `http://localhost:3000` with your browser to see the result.

---

## Thesis Collab – Supabase setup (SQL you can paste)

Run the following **in Supabase SQL editor** (or psql), step by step.

> These statements assume you already have a `profiles` table with `id uuid primary key` used by Supabase Auth.

### 1. Tables

```sql
-- 1.1 Enable pgcrypto if not already enabled (for gen_random_uuid)
create extension if not exists "pgcrypto";

-- 1.2 Thesis projects: 1 student ↔ 1 professor
create table if not exists public.thesis_projects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id),
  supervisor_id uuid not null references public.profiles(id),
  title text not null,
  description text,
  status text not null default 'proposal', -- proposal | research | writing | review | completed
  start_date date,
  deadline date,
  created_at timestamptz not null default now()
);

-- Optional (recommended): at most 1 active thesis per student
-- Adjust the WHERE clause if you want a different notion of "active".
create unique index if not exists thesis_projects_one_active_per_student
on public.thesis_projects (student_id)
where status <> 'completed';

-- 1.3 Milestones for each thesis
create table if not exists public.thesis_milestones (
  id uuid primary key default gen_random_uuid(),
  thesis_id uuid not null references public.thesis_projects(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  status text not null default 'pending', -- pending | submitted | approved | rejected
  supervisor_feedback text,
  created_at timestamptz not null default now()
);

-- 1.4 Submissions for each milestone (versioned files)
create table if not exists public.thesis_submissions (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references public.thesis_milestones(id) on delete cascade,
  version_number int not null,
  file_name text not null,
  file_url text not null, -- public URL in 'thesis-files' bucket
  uploaded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Ensure one row per (milestone, version)
create unique index if not exists thesis_submissions_unique_version
on public.thesis_submissions (milestone_id, version_number);

-- 1.5 Structured supervision comments (not chatty)
create table if not exists public.thesis_comments (
  id uuid primary key default gen_random_uuid(),
  thesis_id uuid not null references public.thesis_projects(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  author_role text not null, -- 'student' or 'supervisor'
  content text not null,
  created_at timestamptz not null default now()
);
```

### 2. Row Level Security (RLS)

The rule of thumb:

- A row is visible only if the user is either:
  - the **student** on that thesis, or
  - the **professor** (supervisor) on that thesis.

```sql
-- Enable RLS
alter table public.thesis_projects enable row level security;
alter table public.thesis_milestones enable row level security;
alter table public.thesis_submissions enable row level security;
alter table public.thesis_comments enable row level security;
```

#### 2.1 `thesis_projects`

```sql
-- Read: student and supervisor can see their thesis rows
create policy thesis_projects_select_participants
on public.thesis_projects
for select
using (
  auth.uid() in (student_id, supervisor_id)
);

-- Insert: typically professors create these (adjust as needed)
create policy thesis_projects_insert_professors
on public.thesis_projects
for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'professor'
  )
);

-- Update: only supervisor can modify a thesis row
create policy thesis_projects_update_supervisor
on public.thesis_projects
for update
using (auth.uid() = supervisor_id)
with check (auth.uid() = supervisor_id);
```

#### 2.2 `thesis_milestones`

```sql
-- Helper: participant predicate via join
create policy thesis_milestones_select_participants
on public.thesis_milestones
for select
using (
  exists (
    select 1
    from public.thesis_projects tp
    where tp.id = thesis_milestones.thesis_id
      and auth.uid() in (tp.student_id, tp.supervisor_id)
  )
);

-- Only supervisor can create/update milestones
create policy thesis_milestones_write_supervisor
on public.thesis_milestones
for all
using (
  exists (
    select 1
    from public.thesis_projects tp
    where tp.id = thesis_milestones.thesis_id
      and auth.uid() = tp.supervisor_id
  )
)
with check (
  exists (
    select 1
    from public.thesis_projects tp
    where tp.id = thesis_milestones.thesis_id
      and auth.uid() = tp.supervisor_id
  )
);
```

#### 2.3 `thesis_submissions`

```sql
-- Read: student and supervisor can see submissions
create policy thesis_submissions_select_participants
on public.thesis_submissions
for select
using (
  exists (
    select 1
    from public.thesis_milestones tm
    join public.thesis_projects tp
      on tp.id = tm.thesis_id
    where tm.id = thesis_submissions.milestone_id
      and auth.uid() in (tp.student_id, tp.supervisor_id)
  )
);

-- Insert: student or supervisor can upload versions
create policy thesis_submissions_insert_participants
on public.thesis_submissions
for insert
with check (
  exists (
    select 1
    from public.thesis_milestones tm
    join public.thesis_projects tp
      on tp.id = tm.thesis_id
    where tm.id = thesis_submissions.milestone_id
      and auth.uid() in (tp.student_id, tp.supervisor_id)
  )
);
```

#### 2.4 `thesis_comments`

```sql
-- Read: only people on that thesis
create policy thesis_comments_select_participants
on public.thesis_comments
for select
using (
  exists (
    select 1
    from public.thesis_projects tp
    where tp.id = thesis_comments.thesis_id
      and auth.uid() in (tp.student_id, tp.supervisor_id)
  )
);

-- Insert: only people on that thesis
create policy thesis_comments_insert_participants
on public.thesis_comments
for insert
with check (
  exists (
    select 1
    from public.thesis_projects tp
    where tp.id = thesis_comments.thesis_id
      and auth.uid() in (tp.student_id, tp.supervisor_id)
  )
);
```

### 3. Storage bucket

In the **Supabase Storage** UI:

- Create a new bucket called **`thesis-files`**.
- Set it to public or use signed URLs, depending on your preference (the current code stores a public URL).

After this, the **Thesis Collab** module should work:

- Students use `/student/thesis` (and the **Thesis Collab** item in the student sidebar).
- Professors use `/professor` → **Thesis Collab** tab to see all assigned students and open each 1‑to‑1 workspace.

