-- Create app_pdf_configs table
CREATE TABLE IF NOT EXISTS public.app_pdf_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_size TEXT DEFAULT 'a4',
    orientation TEXT DEFAULT 'portrait',
    unit TEXT DEFAULT 'mm',
    font_family TEXT DEFAULT 'helvetica',
    font_size NUMERIC DEFAULT 11,
    font_color TEXT DEFAULT '#333333',
    line_height NUMERIC DEFAULT 1.5,
    border_enabled BOOLEAN DEFAULT false,
    border_width NUMERIC DEFAULT 0.5,
    border_style TEXT DEFAULT 'solid',
    border_color TEXT DEFAULT '#e0e0e0',
    margin_top NUMERIC DEFAULT 20,
    margin_bottom NUMERIC DEFAULT 20,
    margin_left NUMERIC DEFAULT 20,
    margin_right NUMERIC DEFAULT 20,
    header_enabled BOOLEAN DEFAULT true,
    header_text TEXT DEFAULT 'Sisgate Hub - Professional Document',
    header_align TEXT DEFAULT 'center',
    header_font_size NUMERIC DEFAULT 9,
    footer_enabled BOOLEAN DEFAULT true,
    footer_text TEXT DEFAULT 'Confidential | Page {page_number} of {total_pages}',
    footer_align TEXT DEFAULT 'center',
    footer_font_size NUMERIC DEFAULT 9,
    watermark_enabled BOOLEAN DEFAULT false,
    watermark_text TEXT DEFAULT 'SISGATE HUB',
    watermark_opacity NUMERIC DEFAULT 0.1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.app_pdf_configs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable all access for authenticated users" ON public.app_pdf_configs
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
