
-- AMUR V8: customizable project case-study sections

create table if not exists public.project_sections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  section_key text not null,
  title text,
  eyebrow text,
  body text,
  layout text not null default 'editorial',
  sort_order integer not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique(project_id, section_key)
);

alter table public.project_images
  add column if not exists section_key text default 'gallery';

alter table public.project_images
  add column if not exists caption text;

-- Authenticated admin can manage project sections
alter table public.project_sections enable row level security;

drop policy if exists "public read project_sections" on public.project_sections;
create policy "public read project_sections"
on public.project_sections for select
using (true);

drop policy if exists "auth manage project_sections" on public.project_sections;
create policy "auth manage project_sections"
on public.project_sections for all
to authenticated
using (true)
with check (true);

-- Make sure project_images can be managed by authenticated admin
alter table public.project_images enable row level security;

drop policy if exists "public read project_images" on public.project_images;
create policy "public read project_images"
on public.project_images for select
using (true);

drop policy if exists "auth manage project_images" on public.project_images;
create policy "auth manage project_images"
on public.project_images for all
to authenticated
using (true)
with check (true);
