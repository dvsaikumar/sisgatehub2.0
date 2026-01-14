-- Run this in your Supabase SQL Editor to enable saving the new Line Height setting
ALTER TABLE public.app_pdf_configs 
ADD COLUMN IF NOT EXISTS line_height NUMERIC DEFAULT 1.5;
