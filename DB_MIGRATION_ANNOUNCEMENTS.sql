-- 📢 CREATE ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  audience_type TEXT NOT NULL CHECK (audience_type IN ('all', 'students', 'professors', 'course', 'team')),
  audience_id UUID, -- course_id or team_id if type is course/team
  priority TEXT NOT NULL CHECK (priority IN ('normal', 'important', 'urgent')),
  display_type TEXT NOT NULL CHECK (display_type IN ('banner', 'popup', 'feed')),
  is_dismissible BOOLEAN DEFAULT true,
  is_sticky BOOLEAN DEFAULT false,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'scheduled', 'expired', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- 🔔 CREATE ANNOUNCEMENT READS / DISMISS TRACKING
CREATE TABLE IF NOT EXISTS announcement_reads (
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  dismissed BOOLEAN DEFAULT false,
  PRIMARY KEY (announcement_id, user_id)
);

-- 🔒 ENABLE RLS (Row Level Security)
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;

-- 🛡️ RLS POLICIES (Users can read announcements directed at them)
-- 1. All users can read 'all' audience type
CREATE POLICY "Anyone can view global announcements" ON announcements
  FOR SELECT USING (audience_type = 'all' AND status = 'active');

-- 2. Role-based reads
CREATE POLICY "Students view student announcements" ON announcements
  FOR SELECT USING (audience_type = 'students' AND status = 'active' AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'student');

CREATE POLICY "Professors view prof announcements" ON announcements
  FOR SELECT USING (audience_type = 'professors' AND status = 'active' AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'professor');

-- 3. Course-based
CREATE POLICY "Course members view course announcements" ON announcements
  FOR SELECT USING (
    audience_type = 'course' AND status = 'active' AND 
    audience_id IN (SELECT course_id FROM course_members WHERE user_id = auth.uid())
  );

-- 4. Team-based
CREATE POLICY "Team members view team announcements" ON announcements
  FOR SELECT USING (
    audience_type = 'team' AND status = 'active' AND 
    audience_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Admin full access bypass if needed, but actions use Service Role anyway.
