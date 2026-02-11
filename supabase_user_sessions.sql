-- Create a public table to track user sessions
create table if not exists public.active_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  access_token_hash text not null, -- used to identify specific session
  device_info text,
  ip_address text,
  user_agent text,
  location text,
  last_active timestamptz default now(),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.active_sessions enable row level security;

-- Policies
create policy "Users can view their own sessions"
  on public.active_sessions for select
  using (auth.uid() = user_id);

create policy "Users can delete their own sessions"
  on public.active_sessions for delete
  using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
  on public.active_sessions for insert
  with check (auth.uid() = user_id);
  
create policy "Users can update their own sessions"
  on public.active_sessions for update
  using (auth.uid() = user_id);
