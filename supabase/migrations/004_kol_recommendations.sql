create table if not exists public.kols (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  handle text,
  avatar_url text,
  cover_image_url text,
  bio text,
  city text,
  languages text[] default '{}',
  specialty_tags text[] default '{}',
  social_links jsonb default '{}'::jsonb,
  follower_count int default 0,
  status text default 'published' check (status in ('draft','published','archived')),
  is_featured boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.kol_visits (
  id uuid primary key default gen_random_uuid(),
  kol_id uuid not null references public.kols(id) on delete cascade,
  entity_type text not null default 'custom' check (entity_type in ('restaurant','attraction','custom')),
  visit_type text not null default 'food' check (visit_type in ('food','attraction')),
  restaurant_slug text,
  attraction_slug text,
  title text not null,
  description text,
  address text,
  city text,
  latitude numeric,
  longitude numeric,
  cover_image_url text,
  rating numeric,
  content_url text,
  visited_at date,
  status text default 'published' check (status in ('draft','published','archived')),
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.kols enable row level security;
alter table public.kol_visits enable row level security;

create policy "kols public read" on public.kols
  for select using (status = 'published' or public.is_admin());

create policy "kols admin write" on public.kols
  for all using (public.is_admin()) with check (public.is_admin());

create policy "kol visits public read" on public.kol_visits
  for select using (
    exists (
      select 1
      from public.kols
      where kols.id = kol_visits.kol_id
        and (kols.status = 'published' or public.is_admin())
    )
    and (status = 'published' or public.is_admin())
  );

create policy "kol visits admin write" on public.kol_visits
  for all using (public.is_admin()) with check (public.is_admin());

create index if not exists idx_kols_status_featured_sort on public.kols(status, is_featured, sort_order);
create index if not exists idx_kols_slug on public.kols(slug);
create index if not exists idx_kol_visits_kol_sort on public.kol_visits(kol_id, sort_order);
create index if not exists idx_kol_visits_type_city on public.kol_visits(visit_type, city);

grant select on public.kols, public.kol_visits to anon, authenticated;
grant insert, update, delete on public.kols, public.kol_visits to authenticated;
