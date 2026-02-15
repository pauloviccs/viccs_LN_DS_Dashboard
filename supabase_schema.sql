-- 1. Profiles Table (Extends auth.users)
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  role text check (role in ('admin', 'client')) default 'client',
  created_at timestamptz default now(),
  primary key (id)
);

-- 2. Media Table (Uploaded content)
create table public.media (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  url text not null,
  type text not null, -- 'image', 'video'
  size bigint,
  created_at timestamptz default now(),
  owner_id uuid references public.profiles(id)
);

-- 3. Playlists Table
create table public.playlists (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  items jsonb default '[]'::jsonb, -- Array of media objects with duration
  created_at timestamptz default now(),
  owner_id uuid references public.profiles(id)
);

-- 4. Screens Table (Digital Signage Players)
create table public.screens (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  pairing_code text unique,
  status text default 'offline', -- 'online', 'offline'
  playlist_id uuid references public.playlists(id),
  assigned_to uuid references public.profiles(id), -- Which client owns this screen
  last_seen timestamptz,
  created_at timestamptz default now()
);

-- 5. Enable RLS
alter table public.profiles enable row level security;
alter table public.media enable row level security;
alter table public.playlists enable row level security;
alter table public.screens enable row level security;

-- 6. RLS Policies (Simplified for Initial Setup)

-- Profiles: Users can read own profile. Admins can read all.
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Media: Admins manage all. Clients read assigned? (Start with Admin only for upload)
create policy "Admins can manage media"
  on media for all
  using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

create policy "Everything viewable"
  on media for select
  using ( true );

-- Playlists: Admins manage all.
create policy "Admins can manage playlists"
  on playlists for all
  using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

create policy "Everyone can view playlists"
  on playlists for select
  using ( true );

-- Screens: Clients can view their assigned screens. Admins manage all.
create policy "Admins manage all screens"
  on screens for all
  using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

create policy "Clients view assigned screens"
  on screens for select
  using ( assigned_to = auth.uid() );

-- 7. Trigger to create Profile on Signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'client'); -- Default role
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. Storage Buckets (Execute in SQL Editor or Dashboard)
insert into storage.buckets (id, name, public) values ('media', 'media', true);

create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'media' );

create policy "Admin Upload"
  on storage.objects for insert
  with check ( bucket_id = 'media' and exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

create policy "Admin Delete"
  on storage.objects for delete
  using ( bucket_id = 'media' and exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );
