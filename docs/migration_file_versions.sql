-- ============================================
-- MIGRATION: file_versions table + project_files updates
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add version columns to project_files
ALTER TABLE project_files
  ADD COLUMN IF NOT EXISTS current_version integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS latest_version_id uuid;

-- 2. Create file_versions table
CREATE TABLE IF NOT EXISTS file_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid NOT NULL REFERENCES project_files(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  file_url text NOT NULL,
  file_size bigint,
  uploaded_by uuid REFERENCES profiles(id),
  change_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_file_versions_file_id ON file_versions(file_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_file_id_version ON file_versions(file_id, version_number DESC);

-- 3. Enable RLS
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies — inherit team-based access from project_files → teams → team_members
-- SELECT: any team member can view versions
CREATE POLICY "Team members can view file versions"
  ON file_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_files pf
      JOIN team_members tm ON tm.team_id = pf.team_id
      WHERE pf.id = file_versions.file_id
        AND tm.user_id = auth.uid()
    )
  );

-- INSERT: any team member can create versions
CREATE POLICY "Team members can insert file versions"
  ON file_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_files pf
      JOIN team_members tm ON tm.team_id = pf.team_id
      WHERE pf.id = file_versions.file_id
        AND tm.user_id = auth.uid()
    )
  );

-- DELETE: any team member can delete versions (cascades from project_files delete)
CREATE POLICY "Team members can delete file versions"
  ON file_versions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM project_files pf
      JOIN team_members tm ON tm.team_id = pf.team_id
      WHERE pf.id = file_versions.file_id
        AND tm.user_id = auth.uid()
    )
  );

-- UPDATE: any team member can update versions
CREATE POLICY "Team members can update file versions"
  ON file_versions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM project_files pf
      JOIN team_members tm ON tm.team_id = pf.team_id
      WHERE pf.id = file_versions.file_id
        AND tm.user_id = auth.uid()
    )
  );

-- Allow service role full access (for admin operations)
CREATE POLICY "Service role full access to file_versions"
  ON file_versions FOR ALL
  USING (auth.role() = 'service_role');

-- 5. Backfill: create v1 entries for all existing project_files
INSERT INTO file_versions (file_id, version_number, file_url, file_size, uploaded_by, change_message, created_at)
SELECT
  pf.id,
  1,
  pf.storage_path,
  pf.file_size,
  pf.uploaded_by,
  'Initial version',
  pf.created_at
FROM project_files pf
WHERE NOT EXISTS (
  SELECT 1 FROM file_versions fv WHERE fv.file_id = pf.id
);

-- 6. Update project_files with latest_version_id from backfill
UPDATE project_files pf
SET
  current_version = 1,
  latest_version_id = (
    SELECT fv.id FROM file_versions fv
    WHERE fv.file_id = pf.id
    ORDER BY fv.version_number DESC
    LIMIT 1
  )
WHERE pf.latest_version_id IS NULL;
