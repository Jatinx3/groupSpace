-- =====================================================
-- ENABLE REALTIME ON MESSAGES TABLE
-- Run this in your Supabase SQL Editor to allow
-- postgres_changes subscriptions to fire on the
-- messages table (required for real-time chat).
-- =====================================================

-- 1. Add messages table to the supabase_realtime publication
--    (This is the key step — without this, no INSERT events fire)
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 2. Make sure RLS is enabled to allow filtered subscriptions
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3. Drop old policies if they conflict
DROP POLICY IF EXISTS "Team members can view messages" ON public.messages;
DROP POLICY IF EXISTS "Team members can insert messages" ON public.messages;

-- 4. SELECT: any authenticated user who is a member of the team
CREATE POLICY "Team members can view messages"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.team_id = messages.team_id
    AND team_members.user_id = auth.uid()
  )
);

-- 5. INSERT: any authenticated team member can send messages
CREATE POLICY "Team members can insert messages"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.team_id = messages.team_id
    AND team_members.user_id = auth.uid()
  )
);
