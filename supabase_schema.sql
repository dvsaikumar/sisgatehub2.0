
-- Create app_groups table (renamed from groups to avoid conflicts)
CREATE TABLE app_groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create user_profiles table (Mockable for Employee Directory)
-- Note: In a real auth scenario, we's keep the reference strict. For this directory demo, we make it flexible.
CREATE TABLE user_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, -- Original Strict Link
  display_name text,
  group_id uuid REFERENCES app_groups(id), -- Updated reference
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE app_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- For development, allowing read/write to authenticated users or service role

-- APP GROUPS POLICIES
CREATE POLICY "Groups are viewable by everyone" ON app_groups
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create groups" ON app_groups
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update groups" ON app_groups
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete groups" ON app_groups
  FOR DELETE USING (auth.role() = 'authenticated');


-- USER PROFILES POLICIES
-- Allow full access to authenticated users to manage the directory
CREATE POLICY "Authenticated users can select profiles" ON user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update profiles" ON user_profiles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete profiles" ON user_profiles
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create app_document_categories table
CREATE TABLE app_document_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  parent_id uuid REFERENCES app_document_categories(id) ON DELETE CASCADE,
  icon text DEFAULT 'Folder',
  created_at timestamptz DEFAULT now()
);

-- Create app_documents table
CREATE TABLE app_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL, -- 'Guides', 'Templates', etc.
  category_id uuid REFERENCES app_document_categories(id) ON DELETE SET NULL, -- Added category link
  content text,
  file_path text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for new tables
ALTER TABLE app_document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_documents ENABLE ROW LEVEL SECURITY;

-- Policies for app_document_categories
CREATE POLICY "Categories viewable by everyone" ON app_document_categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert categories" ON app_document_categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update categories" ON app_document_categories
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete categories" ON app_document_categories
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for app_documents
CREATE POLICY "Documents viewable by everyone" ON app_documents
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert documents" ON app_documents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update documents" ON app_documents
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete documents" ON app_documents
  FOR DELETE USING (auth.role() = 'authenticated');

-- STORAGE POLICIES
-- Ensure the 'documents' bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (usually enabled by default)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; -- Commented out to avoid permission errors

-- Allow public read access to documents
DROP POLICY IF EXISTS "Public Access to Documents" ON storage.objects;
CREATE POLICY "Public Access to Documents"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' );

-- Allow authenticated users to upload files
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update files
DROP POLICY IF EXISTS "Authenticated users can update documents" ON storage.objects;
CREATE POLICY "Authenticated users can update documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete files
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;
CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

-- UPDATE USER PROFILES SCHEMA
-- Add missing columns to user_profiles if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'full_name') THEN
        ALTER TABLE user_profiles ADD COLUMN full_name text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'email') THEN
        ALTER TABLE user_profiles ADD COLUMN email text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'access_level') THEN
        ALTER TABLE user_profiles ADD COLUMN access_level text DEFAULT 'Employee';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'status') THEN
        ALTER TABLE user_profiles ADD COLUMN status text DEFAULT 'Active';
    END IF;
END $$;

-- Create app_mail_configs table
CREATE TABLE IF NOT EXISTS app_mail_configs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  host text NOT NULL,
  port text NOT NULL,
  username text NOT NULL,
  password text,
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for mail configs
ALTER TABLE app_mail_configs ENABLE ROW LEVEL SECURITY;

-- Policies for app_mail_configs
CREATE POLICY "Mail configs are viewable by authenticated users" ON app_mail_configs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert mail configs" ON app_mail_configs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update mail configs" ON app_mail_configs
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete mail configs" ON app_mail_configs
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create app_templates table
CREATE TABLE IF NOT EXISTS app_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text, -- 'Email', 'PDF', etc.
  category text, 
  content text,
  status text DEFAULT 'Active',
  last_used timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for templates
ALTER TABLE app_templates ENABLE ROW LEVEL SECURITY;

-- Policies for app_templates
CREATE POLICY "Templates are viewable by authenticated users" ON app_templates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert templates" ON app_templates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update templates" ON app_templates
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete templates" ON app_templates
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create app_ai_configs table
CREATE TABLE IF NOT EXISTS app_ai_configs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text, -- Custom name for this config
  provider text NOT NULL, -- 'OpenRouter', 'DeepSeek', 'OpenAI', etc.
  api_key text,
  base_url text,
  models text, -- Comma-separated or JSON list of model names
  status text DEFAULT 'Active',
  is_primary boolean DEFAULT false, -- Set to true for the active application model
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for AI configs
ALTER TABLE app_ai_configs ENABLE ROW LEVEL SECURITY;

-- Policies for app_ai_configs
CREATE POLICY "AI configs are viewable by authenticated users" ON app_ai_configs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert AI configs" ON app_ai_configs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update AI configs" ON app_ai_configs
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete AI configs" ON app_ai_configs
  FOR DELETE USING (auth.role() = 'authenticated');
