-- AMUR V20 — interactive merch / product viewer
alter table public.projects
  add column if not exists merch_front_url text;

alter table public.projects
  add column if not exists merch_back_url text;

alter table public.projects
  add column if not exists merch_motion text default 'interactive';

alter table public.projects
  add column if not exists hero_motion text default 'amur';
