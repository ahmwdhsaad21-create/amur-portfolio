-- AMUR V11 — project logo + visual mood
alter table public.projects add column if not exists logo_url text;
alter table public.projects add column if not exists accent_color text default '#b9dceb';
alter table public.projects add column if not exists mood text default 'dark';
