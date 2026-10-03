-- AMUR V26 — controls for hero and section image ratios
-- شغّل الملف مرة واحدة فقط في Supabase SQL Editor.

alter table public.projects
  add column if not exists hero_logo_size integer default 100;

alter table public.projects
  add column if not exists hero_style text default 'royal';

alter table public.project_sections
  add column if not exists image_ratio text default 'landscape';

update public.projects
set hero_logo_size = coalesce(hero_logo_size,100),
    hero_style = coalesce(hero_style,'royal');

update public.project_sections
set image_ratio = coalesce(image_ratio,'landscape');
