-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    user_email TEXT,
    action_type TEXT,
    resource_name TEXT,
    action_description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read/insert for authenticated users" ON public.audit_logs
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Create app_reminders table (renamed from reminders)
CREATE TABLE IF NOT EXISTS public.app_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    schedule_at TIMESTAMP WITH TIME ZONE NOT NULL, -- renamed from start_date to match query usage possibly? 
    -- Wait, Dashboard query was: .gte('schedule_at', now)
    -- The schema I saw had start_date. I should check if I need to map start_date to schedule_at 
    -- or just use schedule_at. I'll use schedule_at to match the code.
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    category TEXT,
    visibility TEXT DEFAULT 'Public',
    priority TEXT DEFAULT 'Medium',
    background_color TEXT DEFAULT '#009B84',
    is_completed BOOLEAN DEFAULT false, -- code used .eq('is_completed', true)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'Active'
);

-- Enable RLS for app_reminders
ALTER TABLE public.app_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for app_reminders" ON public.app_reminders
    FOR ALL USING (true) WITH CHECK (true);
