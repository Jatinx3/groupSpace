-- Add is_versioned column to project_files
-- Default to true for existing versioned files
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS is_versioned BOOLEAN DEFAULT true;

-- Update existing files that might not have versions yet but are part of the structure
-- (Actually defaulting to true is safer to prevent them from disappearing from Structure tab)

-- Create a comment for documentation
COMMENT ON COLUMN project_files.is_versioned IS 'Whether the file follows Git-lite versioning (Structure tab) or is a simple upload (Files tab).';
