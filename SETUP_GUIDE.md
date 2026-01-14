# Database Setup Guide

## Part 1: Initial Tables (Run this if you haven't yet)

```sql
-- 1. Create app_groups table
CREATE TABLE IF NOT EXISTS app_groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- 2. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  email text, -- Added email column for easier access
  group_id uuid REFERENCES app_groups(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE app_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
DROP POLICY IF EXISTS "Groups are viewable by everyone" ON app_groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON app_groups;
DROP POLICY IF EXISTS "Authenticated users can update groups" ON app_groups;
DROP POLICY IF EXISTS "Authenticated users can delete groups" ON app_groups;

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON user_profiles;

-- Group Policies
CREATE POLICY "Groups are viewable by everyone" ON app_groups FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create groups" ON app_groups FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update groups" ON app_groups FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete groups" ON app_groups FOR DELETE USING (auth.role() = 'authenticated');

-- Profile Policies
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles are viewable by everyone" ON user_profiles FOR SELECT USING (true);
```

## Part 2: Two-Way Sync (Auth <-> Profiles)

**Crucial:** Run this to ensure that updates in `user_profiles` (like editing display name) are reflected back to `auth.users`, and vice-versa.

```sql
-- 1. Sync User Creation (Auth -> Profiles)
-- This ensures that when a user signs up, a profile is created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'display_name',
    new.email
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Sync Profile Updates (Profiles -> Auth)
-- This ensures that when you edit 'display_name' in the table, it updates auth.users metadata.
CREATE OR REPLACE FUNCTION public.sync_profile_to_auth()
RETURNS trigger AS $$
BEGIN
  -- Only update if display_name changed
  IF NEW.display_name IS DISTINCT FROM OLD.display_name THEN
      UPDATE auth.users
      SET raw_user_meta_data = 
          COALESCE(raw_user_meta_data, '{}'::jsonb) || 
          jsonb_build_object('display_name', NEW.display_name)
      WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_updated ON public.user_profiles;
CREATE TRIGGER on_profile_updated
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.sync_profile_to_auth();

-- 3. Backfill existing users
INSERT INTO public.user_profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
```
