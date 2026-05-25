create table if not exists public.city_guides (
  id uuid primary key default gen_random_uuid(),
  destination_slug text,
  city text not null,
  slug text unique not null,
  region text check (region in ('north','central','south')),
  latitude numeric,
  longitude numeric,
  cover_image_url text,
  food_themes text[] default '{}',
  districts text[] default '{}',
  suggested_plan text[] default '{}',
  seo_keywords text[] default '{}',
  status text default 'published' check (status in ('draft','published','archived')),
  is_featured boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.city_guide_translations (
  id uuid primary key default gen_random_uuid(),
  city_guide_id uuid references public.city_guides(id) on delete cascade,
  language_code text not null,
  title text,
  summary text,
  seo_title text,
  seo_description text,
  content jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(city_guide_id, language_code)
);

create table if not exists public.ranking_configs (
  id text primary key,
  ranking_key text not null default 'most-booked',
  title text not null,
  description text,
  city text,
  category text,
  language_code text,
  sponsored_mode text default 'include' check (sponsored_mode in ('include','only','exclude')),
  status text default 'published' check (status in ('draft','published','archived')),
  sort_order int default 0,
  rule jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.city_guides enable row level security;
alter table public.city_guide_translations enable row level security;
alter table public.ranking_configs enable row level security;

create policy "city guides public read" on public.city_guides for select using (status = 'published' or public.is_admin());
create policy "city guides admin write" on public.city_guides for all using (public.is_admin()) with check (public.is_admin());

create policy "city guide translations public read" on public.city_guide_translations for select using (
  exists (
    select 1
    from public.city_guides
    where city_guides.id = city_guide_translations.city_guide_id
      and (city_guides.status = 'published' or public.is_admin())
  )
);
create policy "city guide translations admin write" on public.city_guide_translations for all using (public.is_admin()) with check (public.is_admin());

create policy "ranking configs public read" on public.ranking_configs for select using (status = 'published' or public.is_admin());
create policy "ranking configs admin write" on public.ranking_configs for all using (public.is_admin()) with check (public.is_admin());

create index if not exists idx_city_guides_status_sort on public.city_guides(status, sort_order);
create index if not exists idx_city_guides_slug on public.city_guides(slug);
create index if not exists idx_city_guide_translations_guide_language on public.city_guide_translations(city_guide_id, language_code);
create index if not exists idx_ranking_configs_status_sort on public.ranking_configs(status, sort_order);
create index if not exists idx_ranking_configs_key_language on public.ranking_configs(ranking_key, language_code);

grant select on public.city_guides, public.city_guide_translations, public.ranking_configs to anon, authenticated;
grant insert, update, delete on public.city_guides, public.city_guide_translations, public.ranking_configs to authenticated;
