-- Create table to track AI usage
CREATE TABLE IF NOT EXISTS public.ai_usages (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_count INTEGER DEFAULT 0,
    last_used_at DATE DEFAULT CURRENT_DATE
);

-- Enable RLS
ALTER TABLE public.ai_usages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own usage" ON public.ai_usages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON public.ai_usages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON public.ai_usages
    FOR UPDATE USING (auth.uid() = user_id);
