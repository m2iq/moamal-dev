-- Link Portfolio: Supabase schema + basic policies
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  project_url text not null,
  image_url text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

-- Public read access
create policy if not exists "Public read projects"
on public.projects
for select
to anon, authenticated
using (true);

drop policy if exists "Public insert projects" on public.projects;
drop policy if exists "Public update projects" on public.projects;
drop policy if exists "Public delete projects" on public.projects;

-- Writes should go through a protected server API using the Supabase service role key.
-- Do not expose insert/update/delete policies to anon users.

-- Storage bucket note:
-- Create bucket manually from Supabase Dashboard:
-- Name: project-images
-- Public bucket: ON
-- Then add storage policies from Dashboard or SQL for object read/write as needed.
