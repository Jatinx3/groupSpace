-- ==========================================
-- SUPER COLLABORATIVE TASKS MIGRATION
-- Adds the logic to track who last touched
-- a task and unlocks updates for all active
-- team members instead of just leaders.
-- ==========================================

-- 1. Add tracking parameter
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS last_updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Clean out old role-locked RLS policies
DROP POLICY IF EXISTS "Team leaders can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Team leaders can delete tasks" ON public.tasks;

-- 3. Upgrade permissions: allow any authenticated team member to update their team's tasks
CREATE POLICY "Team members can update tasks"
ON public.tasks
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.team_id = tasks.team_id
    AND team_members.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.team_id = tasks.team_id
    AND team_members.user_id = auth.uid()
  )
);

-- 4. Enable any member to also delete tasks
CREATE POLICY "Team members can delete tasks"
ON public.tasks
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.team_id = tasks.team_id
    AND team_members.user_id = auth.uid()
  )
);
