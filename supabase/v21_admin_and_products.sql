
-- AMUR V21 — clean admin + multi products
-- شغّل الملف مرة واحدة فقط في Supabase SQL Editor.

-- إعدادات هوية المشروع
alter table public.projects
  add column if not exists logo_url text;

alter table public.projects
  add column if not exists accent_color text default '#9d1717';

alter table public.projects
  add column if not exists mood text default 'dark';

alter table public.projects
  add column if not exists hero_motion text default 'amur';

-- جدول المنتجات: كل مشروع يقدر يحتوي على عدد غير محدود من المنتجات
create table if not exists public.project_products (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null default 'منتج',
  front_url text,
  back_url text,
  motion text not null default 'interactive',
  sort_order integer not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.project_products enable row level security;

drop policy if exists "public read project_products" on public.project_products;
create policy "public read project_products"
on public.project_products for select
using (enabled = true);

drop policy if exists "auth manage project_products" on public.project_products;
create policy "auth manage project_products"
on public.project_products for all
to authenticated
using (true)
with check (true);

-- تأكيد أعمدة نظام الأقسام القديم حتى تظل كل المشاريع الحالية متوافقة
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
