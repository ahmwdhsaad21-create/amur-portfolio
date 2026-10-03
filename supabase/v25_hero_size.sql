-- AMUR V25 — تحكم في حجم لوجو المشروع
alter table public.projects
  add column if not exists hero_logo_size integer default 100;

update public.projects
set hero_logo_size = 100
where hero_logo_size is null;
