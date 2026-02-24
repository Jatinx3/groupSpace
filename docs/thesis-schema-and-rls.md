## Thesis Collab – Supabase schema & RLS (to apply in dashboard)

This documents the tables and policies the new Thesis Collab module expects.

### Tables

#### 1. `thesis_projects`

- `id uuid primary key default gen_random_uuid()`
- `student_id uuid not null references profiles(id)`
- `supervisor_id uuid not null references profiles(id)`
- `title text not null`
- `description text`
- `status text not null default 'proposal'`  
  Recommended enum values: `proposal`, `research`, `writing`, `review`, `completed`
- `start_date date`
- `deadline date`
- `created_at timestamptz default now()`

Constraint (enforced via app logic + optional DB constraint):

- Each student should have at most **one active thesis** (you can enforce this with a partial unique index on `(student_id)` where `status <> 'completed'`).

#### 2. `thesis_milestones`

- `id uuid primary key default gen_random_uuid()`
- `thesis_id uuid not null references thesis_projects(id) on delete cascade`
- `title text not null`
- `description text`
- `due_date date`
- `status text not null default 'pending'`  
  Recommended values: `pending`, `submitted`, `approved`, `rejected`
- `supervisor_feedback text`
- `created_at timestamptz default now()`

#### 3. `thesis_submissions`

- `id uuid primary key default gen_random_uuid()`
- `milestone_id uuid not null references thesis_milestones(id) on delete cascade`
- `version_number int not null`
- `file_name text not null`
- `file_url text not null` (public URL from the `thesis-files` bucket)
- `uploaded_by uuid not null references profiles(id)`
- `created_at timestamptz default now()`

Suggested unique constraint:

- Unique per milestone + version: `unique (milestone_id, version_number)`

#### 4. `thesis_comments`

- `id uuid primary key default gen_random_uuid()`
- `thesis_id uuid not null references thesis_projects(id) on delete cascade`
- `author_id uuid not null references profiles(id)`
- `author_role text not null` (`'student'` or `'supervisor'`)
- `content text not null`
- `created_at timestamptz default now()`

### Storage bucket

- Create bucket: `thesis-files`
- Files are written under paths like:

  - `thesis/{thesis_id}/{milestone_id}/{timestamp-fileName}`

### RLS policies (high-level intent)

Enable RLS on all four tables and use this shared predicate:

- Let `is_thesis_participant` be:

  - `auth.uid() = thesis_projects.student_id` OR
  - `auth.uid() = thesis_projects.supervisor_id`

You can implement that via joins or by duplicating the predicate per table.

#### `thesis_projects`

- **SELECT / UPDATE**
  - Policy: allow if `auth.uid()` is either `student_id` or `supervisor_id`.
- **INSERT**
  - Typically only supervisors (professors) should create rows; you can:
    - Restrict to users whose `profiles.role = 'professor'`, or
    - Keep it open and rely on the app to only call inserts from supervisors.

Example policy sketch (pseudocode):

```sql
policy "thesis_projects_participants_only"
  on thesis_projects
  for select using ( auth.uid() in (student_id, supervisor_id) );
```

Add similar `using` clauses for `update` / `delete` as needed.

#### `thesis_milestones`

- **SELECT**: allowed if the user participates in the parent thesis.
- **INSERT / UPDATE / DELETE**: allowed only if the user is the supervisor of the parent thesis.

You can express this with a join on `thesis_projects`:

```sql
using (
  exists (
    select 1 from thesis_projects tp
    where tp.id = thesis_milestones.thesis_id
      and auth.uid() in (tp.student_id, tp.supervisor_id)
  )
)
```

and a stricter condition for writes where `auth.uid() = tp.supervisor_id`.

#### `thesis_submissions`

- **SELECT**: allowed to both student and supervisor of the parent thesis.
- **INSERT**: allowed to both student and supervisor (our code blocks uploads to unrelated users).
- **UPDATE / DELETE**: generally not needed from the app; can be supervisor-only or disabled.

Again, join via `thesis_milestones.thesis_id` → `thesis_projects.id` and reuse the participant predicate.

#### `thesis_comments`

- **SELECT**: only participants of the thesis (student + supervisor).
- **INSERT**: only participants of the thesis.
- **UPDATE / DELETE**: optional (e.g. allow author or supervisor).

The app already sets `author_role` to `"student"` / `"supervisor"` based on who they are relative to the thesis.

---

Once these tables, bucket, and policies are created in Supabase, the new `/student/thesis` and `/supervisor/thesis` flows should work end‑to‑end with the code added in this module.

