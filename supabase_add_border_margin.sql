-- Add border_margin column to app_pdf_configs table
ALTER TABLE public.app_pdf_configs 
ADD COLUMN IF NOT EXISTS border_margin NUMERIC DEFAULT 10;

ALTER TABLE public.app_pdf_configs 
ADD COLUMN IF NOT EXISTS watermark_size NUMERIC DEFAULT 72;
