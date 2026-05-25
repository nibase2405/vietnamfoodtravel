create extension if not exists "pgcrypto";

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  phone text,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user','guide','merchant','admin','super_admin')),
  preferred_language text default 'zh-TW',
  status text not null default 'active' check (status in ('active','blocked','pending')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users(id) on delete cascade,
  nationality text,
  birthday date,
  gender text,
  passport_name text,
  emergency_contact_name text,
  emergency_contact_phone text,
  notes text
);

create table public.languages (
  code text primary key,
  name text not null,
  is_active boolean default true
);

create table public.translations (
  id uuid primary key default gen_random_uuid(),
  entity_type text,
  entity_id uuid,
  language_code text references public.languages(code),
  title text,
  subtitle text,
  description text,
  content jsonb,
  seo_title text,
  seo_description text,
  slug text
);

create table public.destinations (
  id uuid primary key default gen_random_uuid(),
  country text default 'Vietnam',
  city text,
  slug text unique,
  region text check (region in ('north','central','south')),
  latitude numeric,
  longitude numeric,
  cover_image_url text,
  status text default 'draft',
  sort_order int default 0,
  created_at timestamptz default now()
);

create table public.tours (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references public.destinations(id),
  title text not null,
  slug text unique not null,
  tour_type text check (tour_type in ('private','semi_self_guided','group','day_trip','custom')),
  theme text[],
  duration_days int,
  duration_nights int,
  min_people int,
  max_people int,
  base_price numeric,
  currency text default 'USD',
  cover_image_url text,
  gallery_urls text[],
  status text default 'draft',
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.tour_itinerary_days (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid references public.tours(id) on delete cascade,
  day_number int,
  title text,
  description text,
  meals jsonb,
  hotel_info text
);

create table public.tour_itinerary_items (
  id uuid primary key default gen_random_uuid(),
  tour_day_id uuid references public.tour_itinerary_days(id) on delete cascade,
  start_time time,
  end_time time,
  title text,
  description text,
  location_name text,
  latitude numeric,
  longitude numeric,
  image_url text,
  sort_order int default 0
);

create table public.tour_inclusions (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid references public.tours(id) on delete cascade,
  type text check (type in ('included','excluded')),
  title text,
  description text
);

create table public.tour_prices (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid references public.tours(id) on delete cascade,
  people_count int,
  price_per_person numeric,
  currency text default 'USD'
);

create table public.custom_trip_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  name text,
  email text,
  phone text,
  travel_start_date date,
  travel_end_date date,
  people_count int,
  budget_min numeric,
  budget_max numeric,
  currency text default 'USD',
  preferred_cities text[],
  interests text[],
  need_guide boolean default false,
  need_car boolean default false,
  need_hotel boolean default false,
  language_preference text[],
  status text default 'new' check (status in ('new','contacted','quoted','confirmed','cancelled')),
  admin_notes text,
  created_at timestamptz default now()
);

create table public.custom_trip_proposals (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.custom_trip_requests(id),
  admin_id uuid references public.users(id),
  title text,
  itinerary jsonb,
  quoted_price numeric,
  currency text default 'USD',
  pdf_url text,
  status text default 'draft' check (status in ('draft','sent','accepted','rejected')),
  created_at timestamptz default now()
);

create table public.guides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  display_name text,
  bio text,
  languages text[],
  service_cities text[],
  specialties text[],
  hourly_rate numeric,
  daily_rate numeric,
  currency text default 'USD',
  rating_avg numeric default 0,
  review_count int default 0,
  status text default 'pending' check (status in ('pending','approved','rejected','suspended')),
  verified_at timestamptz
);

create table public.guide_availability (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid references public.guides(id) on delete cascade,
  available_date date,
  start_time time,
  end_time time,
  is_available boolean default true
);

create table public.guide_services (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid references public.guides(id) on delete cascade,
  title text,
  description text,
  service_type text check (service_type in ('hourly','half_day','full_day','airport_pickup','custom')),
  price numeric,
  currency text default 'USD',
  duration_hours numeric,
  status text default 'active'
);

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references public.destinations(id),
  name text not null,
  slug text unique not null,
  cuisine_type text[],
  price_range text check (price_range in ('low','medium','high','luxury')),
  address text,
  latitude numeric,
  longitude numeric,
  phone text,
  website_url text,
  google_maps_url text,
  rating_avg numeric default 0,
  review_count int default 0,
  opening_hours jsonb,
  menu_images text[],
  cover_image_url text,
  gallery_urls text[],
  status text default 'draft' check (status in ('draft','published','claimed','closed')),
  is_featured boolean default false,
  created_at timestamptz default now()
);

create table public.restaurant_claims (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references public.restaurants(id),
  merchant_user_id uuid references public.users(id),
  business_license_url text,
  contact_name text,
  contact_phone text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  admin_note text,
  created_at timestamptz default now()
);

create table public.restaurant_menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  name text,
  description text,
  price numeric,
  currency text default 'VND',
  image_url text,
  category text,
  is_active boolean default true
);

create table public.attractions (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references public.destinations(id),
  name text not null,
  slug text unique not null,
  category text[],
  address text,
  latitude numeric,
  longitude numeric,
  price_info text,
  opening_hours jsonb,
  cover_image_url text,
  gallery_urls text[],
  rating_avg numeric default 0,
  status text default 'draft'
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  booking_type text check (booking_type in ('tour','guide','custom_trip','transport','hotel','visa')),
  tour_id uuid references public.tours(id),
  guide_service_id uuid references public.guide_services(id),
  custom_trip_proposal_id uuid references public.custom_trip_proposals(id),
  travel_date date,
  people_count int,
  total_amount numeric,
  currency text default 'USD',
  status text default 'pending' check (status in ('pending','confirmed','completed','cancelled','refunded')),
  payment_status text default 'unpaid' check (payment_status in ('unpaid','paid','partial_paid','refunded')),
  contact_name text,
  contact_phone text,
  contact_email text,
  notes text,
  created_at timestamptz default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id),
  provider text check (provider in ('stripe','paypal','momo','zalopay','bank_transfer','cash')),
  amount numeric,
  currency text,
  transaction_id text,
  status text default 'pending' check (status in ('pending','success','failed','refunded')),
  paid_at timestamptz
);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  entity_type text check (entity_type in ('tour','restaurant','attraction','guide')),
  entity_id uuid,
  created_at timestamptz default now(),
  unique (user_id, entity_type, entity_id)
);

create table public.trip_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  title text,
  destination_id uuid references public.destinations(id),
  start_date date,
  end_date date,
  visibility text default 'private' check (visibility in ('private','public')),
  created_at timestamptz default now()
);

create table public.trip_list_items (
  id uuid primary key default gen_random_uuid(),
  trip_list_id uuid references public.trip_lists(id) on delete cascade,
  entity_type text,
  entity_id uuid,
  custom_title text,
  latitude numeric,
  longitude numeric,
  visit_date date,
  sort_order int default 0,
  notes text
);

create table public.ai_trip_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  destination_id uuid references public.destinations(id),
  prompt jsonb,
  generated_itinerary jsonb,
  map_points jsonb,
  estimated_budget numeric,
  currency text default 'USD',
  pdf_url text,
  created_at timestamptz default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  category text,
  tags text[],
  cover_image_url text,
  excerpt text,
  content jsonb,
  author_id uuid references public.users(id),
  status text default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  seo_title text,
  seo_description text,
  canonical_url text
);

create table public.seo_pages (
  id uuid primary key default gen_random_uuid(),
  path text unique,
  language_code text,
  title text,
  description text,
  og_image_url text,
  schema_json jsonb,
  hreflang jsonb
);

create table public.ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  merchant_user_id uuid references public.users(id),
  title text,
  placement text check (placement in ('homepage_banner','map_featured','restaurant_featured','blog_banner','destination_page')),
  target_city text,
  start_date date,
  end_date date,
  budget numeric,
  currency text default 'USD',
  status text default 'draft' check (status in ('draft','active','paused','ended')),
  image_url text,
  link_url text
);

create table public.ad_impressions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.ad_campaigns(id),
  user_id uuid,
  page_path text,
  created_at timestamptz default now()
);

create table public.ad_clicks (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.ad_campaigns(id),
  user_id uuid,
  page_path text,
  created_at timestamptz default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  entity_type text check (entity_type in ('tour','guide','restaurant','attraction')),
  entity_id uuid,
  rating int check (rating between 1 and 5),
  title text,
  content text,
  image_urls text[],
  status text default 'pending' check (status in ('pending','published','hidden')),
  created_at timestamptz default now()
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  subject text,
  status text default 'open',
  priority text default 'medium',
  assigned_admin_id uuid references public.users(id),
  created_at timestamptz default now()
);

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.support_tickets(id) on delete cascade,
  sender_id uuid references public.users(id),
  message text,
  attachments text[],
  created_at timestamptz default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

insert into public.languages (code, name) values
('zh-TW','繁體中文'), ('en','English'), ('vi','Tiếng Việt'), ('ko','한국어'), ('ja','日本語')
on conflict (code) do nothing;

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_role() in ('admin','super_admin')
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_role() = 'super_admin'
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.prevent_admin_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role in ('admin','super_admin') and old.role is distinct from new.role and not public.is_super_admin() then
    raise exception 'Only super_admin can assign admin or super_admin roles';
  end if;
  return new;
end;
$$;

create trigger prevent_admin_role_escalation
before update of role on public.users
for each row execute function public.prevent_admin_role_escalation();

create trigger users_set_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger tours_set_updated_at before update on public.tours for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.user_profiles enable row level security;
alter table public.languages enable row level security;
alter table public.translations enable row level security;
alter table public.destinations enable row level security;
alter table public.tours enable row level security;
alter table public.tour_itinerary_days enable row level security;
alter table public.tour_itinerary_items enable row level security;
alter table public.tour_inclusions enable row level security;
alter table public.tour_prices enable row level security;
alter table public.custom_trip_requests enable row level security;
alter table public.custom_trip_proposals enable row level security;
alter table public.guides enable row level security;
alter table public.guide_availability enable row level security;
alter table public.guide_services enable row level security;
alter table public.restaurants enable row level security;
alter table public.restaurant_claims enable row level security;
alter table public.restaurant_menu_items enable row level security;
alter table public.attractions enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.favorites enable row level security;
alter table public.trip_lists enable row level security;
alter table public.trip_list_items enable row level security;
alter table public.ai_trip_plans enable row level security;
alter table public.blog_posts enable row level security;
alter table public.seo_pages enable row level security;
alter table public.ad_campaigns enable row level security;
alter table public.ad_impressions enable row level security;
alter table public.ad_clicks enable row level security;
alter table public.reviews enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.site_settings enable row level security;

create policy "admins full access users" on public.users for all using (public.is_admin()) with check (public.is_admin());
create policy "users read self" on public.users for select using (id = auth.uid() or public.is_admin());
create policy "users update self non admin roles guarded" on public.users for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

create policy "languages readable" on public.languages for select using (true);
create policy "admin languages" on public.languages for all using (public.is_admin()) with check (public.is_admin());
create policy "translations readable" on public.translations for select using (true);
create policy "admin translations" on public.translations for all using (public.is_admin()) with check (public.is_admin());

create policy "public destinations" on public.destinations for select using (status = 'published' or public.is_admin());
create policy "admin destinations" on public.destinations for all using (public.is_admin()) with check (public.is_admin());
create policy "public tours" on public.tours for select using (status = 'published' or public.is_admin());
create policy "admin tours" on public.tours for all using (public.is_admin()) with check (public.is_admin());
create policy "public restaurants" on public.restaurants for select using (status in ('published','claimed') or public.is_admin());
create policy "admin restaurants" on public.restaurants for all using (public.is_admin()) with check (public.is_admin());
create policy "merchant claimed restaurants" on public.restaurants for update using (exists (select 1 from public.restaurant_claims rc where rc.restaurant_id = restaurants.id and rc.merchant_user_id = auth.uid() and rc.status = 'approved')) with check (exists (select 1 from public.restaurant_claims rc where rc.restaurant_id = restaurants.id and rc.merchant_user_id = auth.uid() and rc.status = 'approved'));
create policy "public attractions" on public.attractions for select using (status = 'published' or public.is_admin());
create policy "admin attractions" on public.attractions for all using (public.is_admin()) with check (public.is_admin());
create policy "public blog" on public.blog_posts for select using (status = 'published' or public.is_admin());
create policy "admin blog" on public.blog_posts for all using (public.is_admin()) with check (public.is_admin());
create policy "public guides" on public.guides for select using (status = 'approved' or user_id = auth.uid() or public.is_admin());

create policy "admin itinerary days" on public.tour_itinerary_days for all using (public.is_admin()) with check (public.is_admin());
create policy "public itinerary days" on public.tour_itinerary_days for select using (exists (select 1 from public.tours t where t.id = tour_itinerary_days.tour_id and t.status = 'published') or public.is_admin());
create policy "admin itinerary items" on public.tour_itinerary_items for all using (public.is_admin()) with check (public.is_admin());
create policy "public itinerary items" on public.tour_itinerary_items for select using (exists (select 1 from public.tour_itinerary_days d join public.tours t on t.id = d.tour_id where d.id = tour_itinerary_items.tour_day_id and t.status = 'published') or public.is_admin());
create policy "admin inclusions" on public.tour_inclusions for all using (public.is_admin()) with check (public.is_admin());
create policy "public inclusions" on public.tour_inclusions for select using (exists (select 1 from public.tours t where t.id = tour_inclusions.tour_id and t.status = 'published') or public.is_admin());
create policy "admin prices" on public.tour_prices for all using (public.is_admin()) with check (public.is_admin());
create policy "public prices" on public.tour_prices for select using (exists (select 1 from public.tours t where t.id = tour_prices.tour_id and t.status = 'published') or public.is_admin());

create policy "own profiles" on public.user_profiles for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "own bookings" on public.bookings for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "admin payments" on public.payments for all using (public.is_admin()) with check (public.is_admin());
create policy "own favorites" on public.favorites for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "own trip lists" on public.trip_lists for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "own trip list items" on public.trip_list_items for all using (exists (select 1 from public.trip_lists tl where tl.id = trip_list_items.trip_list_id and tl.user_id = auth.uid()) or public.is_admin()) with check (exists (select 1 from public.trip_lists tl where tl.id = trip_list_items.trip_list_id and tl.user_id = auth.uid()) or public.is_admin());
create policy "own ai plans" on public.ai_trip_plans for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "own custom trip requests read" on public.custom_trip_requests for select using (user_id = auth.uid() or public.is_admin());
create policy "own custom trip requests insert" on public.custom_trip_requests for insert with check (user_id = auth.uid() or user_id is null or public.is_admin());
create policy "own custom trip requests update" on public.custom_trip_requests for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "admin custom proposals" on public.custom_trip_proposals for all using (public.is_admin()) with check (public.is_admin());
create policy "own support tickets" on public.support_tickets for all using (user_id = auth.uid() or assigned_admin_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "own support messages" on public.support_messages for all using (exists (select 1 from public.support_tickets st where st.id = support_messages.ticket_id and (st.user_id = auth.uid() or st.assigned_admin_id = auth.uid())) or public.is_admin()) with check (exists (select 1 from public.support_tickets st where st.id = support_messages.ticket_id and st.user_id = auth.uid()) or public.is_admin());
create policy "settings public read" on public.site_settings for select using (true);
create policy "settings admin write" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

create index if not exists idx_destinations_status_region on public.destinations(status, region);
create index if not exists idx_tours_status_featured on public.tours(status, is_featured);
create index if not exists idx_tours_destination_id on public.tours(destination_id);
create index if not exists idx_restaurants_status_featured on public.restaurants(status, is_featured);
create index if not exists idx_restaurants_destination_id on public.restaurants(destination_id);
create index if not exists idx_attractions_status_destination_id on public.attractions(status, destination_id);
create index if not exists idx_guides_status_rating on public.guides(status, rating_avg);
create index if not exists idx_bookings_user_status on public.bookings(user_id, status);
create index if not exists idx_favorites_user_entity on public.favorites(user_id, entity_type);
create index if not exists idx_trip_lists_user_id on public.trip_lists(user_id);
create index if not exists idx_reviews_entity_status on public.reviews(entity_type, entity_id, status);
create index if not exists idx_blog_posts_status_published_at on public.blog_posts(status, published_at);
create index if not exists idx_ad_campaigns_merchant_status on public.ad_campaigns(merchant_user_id, status);

create policy "guide owns guide profile" on public.guides for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "guide owns services" on public.guide_services for all using (exists (select 1 from public.guides g where g.id = guide_services.guide_id and g.user_id = auth.uid()) or public.is_admin()) with check (exists (select 1 from public.guides g where g.id = guide_services.guide_id and g.user_id = auth.uid()) or public.is_admin());
create policy "guide owns availability" on public.guide_availability for all using (exists (select 1 from public.guides g where g.id = guide_availability.guide_id and g.user_id = auth.uid()) or public.is_admin()) with check (exists (select 1 from public.guides g where g.id = guide_availability.guide_id and g.user_id = auth.uid()) or public.is_admin());
create policy "public approved guide services" on public.guide_services for select using (exists (select 1 from public.guides g where g.id = guide_services.guide_id and g.status = 'approved') or public.is_admin());
create policy "public approved guide availability" on public.guide_availability for select using (exists (select 1 from public.guides g where g.id = guide_availability.guide_id and g.status = 'approved') or public.is_admin());

create policy "merchant claims" on public.restaurant_claims for all using (merchant_user_id = auth.uid() or public.is_admin()) with check (merchant_user_id = auth.uid() or public.is_admin());
create policy "restaurant menu read" on public.restaurant_menu_items for select using (exists (select 1 from public.restaurants r where r.id = restaurant_menu_items.restaurant_id and r.status in ('published','claimed')) or public.is_admin());
create policy "restaurant menu manage" on public.restaurant_menu_items for all using (public.is_admin() or exists (select 1 from public.restaurant_claims rc where rc.restaurant_id = restaurant_menu_items.restaurant_id and rc.merchant_user_id = auth.uid() and rc.status = 'approved')) with check (public.is_admin() or exists (select 1 from public.restaurant_claims rc where rc.restaurant_id = restaurant_menu_items.restaurant_id and rc.merchant_user_id = auth.uid() and rc.status = 'approved'));
create policy "merchant ad campaigns" on public.ad_campaigns for all using (merchant_user_id = auth.uid() or public.is_admin()) with check (merchant_user_id = auth.uid() or public.is_admin());
create policy "ad analytics insert" on public.ad_impressions for insert with check (true);
create policy "ad analytics admin read" on public.ad_impressions for select using (public.is_admin() or exists (select 1 from public.ad_campaigns ac where ac.id = ad_impressions.campaign_id and ac.merchant_user_id = auth.uid()));
create policy "ad clicks insert" on public.ad_clicks for insert with check (true);
create policy "ad clicks admin read" on public.ad_clicks for select using (public.is_admin() or exists (select 1 from public.ad_campaigns ac where ac.id = ad_clicks.campaign_id and ac.merchant_user_id = auth.uid()));

create policy "published reviews read" on public.reviews for select using (status = 'published' or user_id = auth.uid() or public.is_admin());
create policy "own reviews write" on public.reviews for insert with check (user_id = auth.uid());
create policy "admin reviews" on public.reviews for all using (public.is_admin()) with check (public.is_admin());
create policy "admin seo" on public.seo_pages for all using (public.is_admin()) with check (public.is_admin());
create policy "seo public read" on public.seo_pages for select using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
('avatars','avatars',true,4194304,array['image/jpeg','image/jpg','image/png','image/webp']),
('tours','tours',true,4194304,array['image/jpeg','image/jpg','image/png','image/webp']),
('restaurants','restaurants',true,4194304,array['image/jpeg','image/jpg','image/png','image/webp']),
('guides','guides',true,4194304,array['image/jpeg','image/jpg','image/png','image/webp']),
('attractions','attractions',true,4194304,array['image/jpeg','image/jpg','image/png','image/webp']),
('blog','blog',true,4194304,array['image/jpeg','image/jpg','image/png','image/webp']),
('documents','documents',false,10485760,null),
('ads','ads',true,4194304,array['image/jpeg','image/jpg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "public image read" on storage.objects for select using (bucket_id in ('avatars','tours','restaurants','guides','attractions','blog','ads'));
create policy "authenticated uploads" on storage.objects for insert to authenticated with check (bucket_id in ('avatars','tours','restaurants','guides','attractions','blog','documents','ads'));
create policy "owner or admin storage update" on storage.objects for update to authenticated using (owner = auth.uid() or public.is_admin()) with check (owner = auth.uid() or public.is_admin());
create policy "owner or admin storage delete" on storage.objects for delete to authenticated using (owner = auth.uid() or public.is_admin());
