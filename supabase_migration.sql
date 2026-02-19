-- SAFE MIGRATION SCRIPT
-- Run this in the Supabase SQL Editor to update your database.

-- 1. Profiles Table Updates
create table if not exists public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  role text check (role in ('admin', 'client')) default 'client',
  created_at timestamptz default now(),
  primary key (id)
);

-- Add new columns safely
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'avatar_url') then
    alter table public.profiles add column avatar_url text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'phone') then
    alter table public.profiles add column phone text;
  end if;
end $$;


-- 2. Media Table
create table if not exists public.media (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  url text not null,
  type text not null, -- 'image', 'video'
  size bigint,
  created_at timestamptz default now(),
  owner_id uuid references public.profiles(id)
);

-- 3. Playlists Table
create table if not exists public.playlists (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  items jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  owner_id uuid references public.profiles(id)
);

-- 4. Screens Table
create table if not exists public.screens (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  pairing_code text unique,
  status text default 'offline',
  playlist_id uuid references public.playlists(id),
  assigned_to uuid references public.profiles(id),
  last_seen timestamptz,
  created_at timestamptz default now()
);

-- 5. Enable RLS (Safe to run multiple times)
alter table public.profiles enable row level security;
alter table public.media enable row level security;
alter table public.playlists enable row level security;
alter table public.screens enable row level security;


-- 6. Re-create RLS Policies (Drop existing to update)

-- Profiles
drop policy if exists "Public profiles are viewable by everyone" on profiles;
create policy "Public profiles are viewable by everyone" on profiles for select using ( true );

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles for update using ( auth.uid() = id );

-- Media
drop policy if exists "Admins can manage media" on media;
create policy "Admins can manage media" on media for all using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

drop policy if exists "Everything viewable" on media;
create policy "Everything viewable" on media for select using ( true );

-- Playlists
drop policy if exists "Admins can manage playlists" on playlists;
create policy "Admins can manage playlists" on playlists for all using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

drop policy if exists "Everyone can view playlists" on playlists;
create policy "Everyone can view playlists" on playlists for select using ( true );

-- Screens
drop policy if exists "Admins manage all screens" on screens;
create policy "Admins manage all screens" on screens for all using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

drop policy if exists "Clients view assigned screens" on screens;
create policy "Clients view assigned screens" on screens for select using ( assigned_to = auth.uid() );


-- 7. Triggers
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'client')
  on conflict (id) do nothing; -- Prevent errors on duplicates
  return new;
end;
$$;

-- Drop trigger first to ensure clean creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 8. Storage Buckets & Policies
insert into storage.buckets (id, name, public) values ('media', 'media', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Media Storage Policies
drop policy if exists "Public Access Media" on storage.objects;
create policy "Public Access Media"
  on storage.objects for select
  using ( bucket_id = 'media' );

drop policy if exists "Admin Upload Media" on storage.objects;
create policy "Admin Upload Media"
  on storage.objects for insert
  with check ( bucket_id = 'media' and exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

drop policy if exists "Admin Delete Media" on storage.objects;
create policy "Admin Delete Media"
  on storage.objects for delete
  using ( bucket_id = 'media' and exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

-- Avatars Storage Policies
drop policy if exists "Public Access Avatars" on storage.objects;
create policy "Public Access Avatars"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

drop policy if exists "User Upload Avatar" on storage.objects;
create policy "User Upload Avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1] );

drop policy if exists "User Update Avatar" on storage.objects;
create policy "User Update Avatar"
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1] );
