-- Add this to your Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.app_pdf_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_size TEXT NOT NULL DEFAULT 'a4',
    orientation TEXT NOT NULL DEFAULT 'portrait',
    unit TEXT NOT NULL DEFAULT 'mm',
    font_family TEXT NOT NULL DEFAULT 'helvetica',
    font_size INTEGER NOT NULL DEFAULT 11,
    font_color TEXT NOT NULL DEFAULT '#333333',
    margin_top NUMERIC NOT NULL DEFAULT 20,
    margin_bottom NUMERIC NOT NULL DEFAULT 20,
    margin_left NUMERIC NOT NULL DEFAULT 20,
    margin_right NUMERIC NOT NULL DEFAULT 20,
    header_enabled BOOLEAN NOT NULL DEFAULT true,
    header_text TEXT DEFAULT ' Sisgate Hub - Professional Document',
    header_align TEXT NOT NULL DEFAULT 'center',
    header_font_size INTEGER NOT NULL DEFAULT 9,
    footer_enabled BOOLEAN NOT NULL DEFAULT true,
    footer_text TEXT DEFAULT 'Confidential | Page {page_number} of {total_pages}',
    footer_align TEXT NOT NULL DEFAULT 'center',
    footer_font_size INTEGER NOT NULL DEFAULT 9,
    border_enabled BOOLEAN NOT NULL DEFAULT false,
    border_width NUMERIC NOT NULL DEFAULT 0.5,
    border_style TEXT NOT NULL DEFAULT 'solid',
    border_color TEXT NOT NULL DEFAULT '#e0e0e0',
    watermark_enabled BOOLEAN NOT NULL DEFAULT false,
    watermark_text TEXT DEFAULT 'SISGATE HUB',
    watermark_opacity NUMERIC NOT NULL DEFAULT 0.1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.app_pdf_configs ENABLE ROW LEVEL SECURITY;

-- Create policy for all users to read
CREATE POLICY "Allow all public reads on PDF configs" ON public.app_pdf_configs
    FOR SELECT USING (true);

-- Create policy for users to manage (you might want to restrict this to admins later)
CREATE POLICY "Allow authenticated users to update PDF configs" ON public.app_pdf_configs
    FOR ALL USING (auth.role() = 'authenticated');
