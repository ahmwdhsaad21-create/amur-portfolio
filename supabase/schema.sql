create extension if not exists pgcrypto;
create table if not exists public.admin_users(user_id uuid primary key references auth.users(id) on delete cascade);
create table if not exists public.projects(id uuid primary key default gen_random_uuid(),title text not null,slug text unique not null,category text,subtitle text,description text,cover_url text,sort_order int default 0,published boolean default true,created_at timestamptz default now());
create table if not exists public.project_images(id uuid primary key default gen_random_uuid(),project_id uuid references public.projects(id) on delete cascade,image_url text not null,sort_order int default 0);
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from public.admin_users where user_id=auth.uid())$$;
alter table public.admin_users enable row level security;alter table public.projects enable row level security;alter table public.project_images enable row level security;
drop policy if exists "read projects" on public.projects;create policy "read projects" on public.projects for select using(published=true or public.is_admin());
drop policy if exists "manage projects" on public.projects;create policy "manage projects" on public.projects for all using(public.is_admin()) with check(public.is_admin());
drop policy if exists "read images" on public.project_images;create policy "read images" on public.project_images for select using(true);
drop policy if exists "manage images" on public.project_images;create policy "manage images" on public.project_images for all using(public.is_admin()) with check(public.is_admin());
insert into storage.buckets(id,name,public) values('portfolio','portfolio',true) on conflict(id) do update set public=true;
drop policy if exists "public storage read" on storage.objects;create policy "public storage read" on storage.objects for select using(bucket_id='portfolio');
drop policy if exists "admin storage insert" on storage.objects;create policy "admin storage insert" on storage.objects for insert with check(bucket_id='portfolio' and public.is_admin());
drop policy if exists "admin storage delete" on storage.objects;create policy "admin storage delete" on storage.objects for delete using(bucket_id='portfolio' and public.is_admin());
-- بعد إنشاء مستخدم الأدمن في Authentication:
-- insert into public.admin_users(user_id) values ('USER_UUID_HERE');
