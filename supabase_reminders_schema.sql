-- Create reminders table
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    category TEXT,
    visibility TEXT DEFAULT 'Public',
    priority TEXT DEFAULT 'Medium',
    background_color TEXT DEFAULT '#009B84',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional linking to auth users
    status TEXT DEFAULT 'Active'
);

-- Enable RLS (Optional but good practice)
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Creating a policy allows everyone to read/write for this demo context, 
-- or you can restrict it. For now, I will create a permissive policy 
-- if RLS is enabled, or just leave it open if RLS is disabled by default in your setup.
-- Assuming dev mode:
CREATE POLICY "Enable all access for all users" ON public.reminders
    FOR ALL USING (true) WITH CHECK (true);

-- Categories table if needed, but the prompt says "Categories for the reminder" 
-- which might just be a dropdown. I'll use a simple dropdown in the UI for simplicity 
-- unless "Categories" implies managing them key-value. 
-- The user said "Also create a necessary tables... Categories for the reminder".
-- I'll create a categories table just in case they want to manage them.

CREATE TABLE IF NOT EXISTS public.reminder_categories (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#3b7dd8',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.reminder_categories (name, color) VALUES 
('Work', '#3b7dd8'),
('Personal', '#ffc107'),
('Important', '#dc3545'),
('Travel', '#28a745')
ON CONFLICT (name) DO NOTHING;
