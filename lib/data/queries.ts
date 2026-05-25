import { createClient } from "@/lib/supabase/server";
import { attractions, blogPosts, destinations, guides, kols, medicalClinics, restaurants, services, tours } from "@/lib/data/mock";
import { cityGuideRecordsToGuides, defaultCityGuideRecords, normalizeCityGuideRecords } from "@/lib/city-guide-records";
import { normalizeMedicalClinics } from "@/lib/medical-clinics";
import { normalizeRankingSettings } from "@/lib/ranking-settings";
import { normalizeServices } from "@/lib/services";
import { enrichKOL, normalizeKOLs } from "@/lib/kols";
import type { SupportedLocale } from "@/lib/i18n/config";
import type { Attraction, BlogPost, Destination, Guide, KOL, MedicalClinic, Restaurant, Service, Tour } from "@/types";

export type PublicFilters = Record<string, string | string[] | undefined>;

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

async function runQuery<T>(query: () => PromiseLike<{ data: T | null; error: unknown }>, fallback: T) {
  if (!hasSupabaseEnv()) return fallback;
  try {
    const { data, error } = await query();
    if (error || !data) return fallback;
    return data;
  } catch {
    return fallback;
  }
}

export async function getPublicDestinationsData(): Promise<Destination[]> {
  return runQuery(async () => {
    const supabase = await createClient();
    return supabase.from("destinations").select("*").eq("status", "published").order("sort_order");
  }, destinations);
}

export async function getPublicDestinationBySlugData(slug: string): Promise<Destination | null> {
  const fallback = destinations.find((item) => item.slug === slug) ?? null;
  return runQuery(async () => {
    const supabase = await createClient();
    return supabase.from("destinations").select("*").eq("slug", slug).single();
  }, fallback);
}

function textIncludes(value: unknown, keyword?: string) {
  if (!keyword) return true;
  return String(value ?? "").toLowerCase().includes(keyword.toLowerCase());
}

function arrayIncludes(values: unknown, keyword?: string) {
  if (!keyword) return true;
  return Array.isArray(values) && values.some((value) => textIncludes(value, keyword));
}

function numericValue(value: unknown) {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function restaurantMetric(restaurant: Restaurant, keys: string[], fallback = 0) {
  const row = restaurant as Restaurant & Record<string, unknown>;
  for (const key of keys) {
    const value = numericValue(row[key]);
    if (value) return value;
  }
  return fallback;
}

function sortRestaurants(restaurants: Restaurant[], sort: string) {
  const sorted = [...restaurants];
  if (sort === "most_booked") {
    return sorted.sort((a, b) =>
      restaurantMetric(b, ["booking_count", "reservation_count", "bookings_count"], numericValue(b.review_count)) -
      restaurantMetric(a, ["booking_count", "reservation_count", "bookings_count"], numericValue(a.review_count))
    );
  }
  if (sort === "local_most_booked") {
    return sorted.sort((a, b) =>
      restaurantMetric(b, ["local_booking_count", "local_reservation_count", "local_bookings_count"], numericValue(b.review_count) * 0.5) -
      restaurantMetric(a, ["local_booking_count", "local_reservation_count", "local_bookings_count"], numericValue(a.review_count) * 0.5)
    );
  }
  if (sort === "most_viewed") {
    return sorted.sort((a, b) =>
      restaurantMetric(b, ["view_count", "views_count", "page_views"], numericValue(b.review_count) * 10) -
      restaurantMetric(a, ["view_count", "views_count", "page_views"], numericValue(a.review_count) * 10)
    );
  }
  return sorted;
}

export async function getPublicToursData(filters: PublicFilters = {}): Promise<Tour[]> {
  const data = await runQuery(async () => {
    const supabase = await createClient();
    return supabase.from("tours").select("*, destinations(*)").eq("status", "published").order("is_featured", { ascending: false }).order("created_at", { ascending: false });
  }, tours);
  const destination = String(filters.destination ?? "");
  const theme = String(filters.theme ?? "");
  const tourType = String(filters.tour_type ?? "");
  const maxPrice = Number(filters.max_price || 0);
  const days = Number(filters.days || 0);
  const sorted = [...data].filter((tour) =>
    textIncludes(tour.destinations?.city, destination) &&
    arrayIncludes(tour.theme, theme) &&
    (!tourType || tour.tour_type === tourType) &&
    (!maxPrice || Number(tour.base_price ?? 0) <= maxPrice) &&
    (!days || Number(tour.duration_days ?? 0) === days)
  );
  if (filters.sort === "price_asc") return sorted.sort((a, b) => Number(a.base_price ?? 0) - Number(b.base_price ?? 0));
  if (filters.sort === "price_desc") return sorted.sort((a, b) => Number(b.base_price ?? 0) - Number(a.base_price ?? 0));
  return sorted;
}

export async function getPublicTourBySlugData(slug: string): Promise<(Tour & Record<string, unknown>) | null> {
  const fallback = tours.find((item) => item.slug === slug) ?? null;
  return runQuery(async () => {
    const supabase = await createClient();
    return supabase
      .from("tours")
      .select("*, destinations(*), tour_itinerary_days(*, tour_itinerary_items(*)), tour_inclusions(*), tour_prices(*)")
      .eq("slug", slug)
      .single();
  }, fallback);
}

export async function getPublicRestaurantsData(filters: PublicFilters = {}): Promise<Restaurant[]> {
  const data = await runQuery(async () => {
    const supabase = await createClient();
    return supabase.from("restaurants").select("*, destinations(*)").in("status", ["published", "claimed"]).order("is_featured", { ascending: false }).order("rating_avg", { ascending: false });
  }, restaurants);
  const q = String(filters.q ?? "");
  const city = String(filters.city ?? "");
  const district = String(filters.district ?? "");
  const cuisine = String(filters.cuisine ?? "");
  const priceRange = String(filters.price_range ?? "");
  const minRating = Number(filters.min_rating || 0);
  const featured = filters.featured === "true";
  const open = String(filters.open ?? "");
  const features = String(filters.features ?? "");
  const sort = String(filters.sort ?? "");
  const filtered = data.filter((restaurant) =>
    (!q || textIncludes(restaurant.name, q) || textIncludes(restaurant.description, q) || arrayIncludes(restaurant.cuisine_type, q) || arrayIncludes(restaurant.recommended_dishes, q)) &&
    textIncludes(restaurant.destinations?.city, city) &&
    textIncludes(restaurant.district, district) &&
    arrayIncludes(restaurant.cuisine_type, cuisine) &&
    (!priceRange || restaurant.price_range === priceRange) &&
    (!minRating || Number(restaurant.rating_avg ?? 0) >= minRating) &&
    (!open || Boolean(restaurant.is_open) === (open === "true")) &&
    (!features || arrayIncludes(restaurant.features, features) || arrayIncludes(restaurant.languages, features)) &&
    (!featured || restaurant.is_featured)
  );
  return sortRestaurants(filtered, sort);
}

export async function getPublicRestaurantBySlugData(slug: string): Promise<(Restaurant & Record<string, unknown>) | null> {
  const fallback = restaurants.find((item) => item.slug === slug) ?? null;
  return runQuery(async () => {
    const supabase = await createClient();
    return supabase.from("restaurants").select("*, destinations(*), restaurant_menu_items(*)").eq("slug", slug).single();
  }, fallback);
}

export async function getPublicAttractionsData(filters: PublicFilters = {}): Promise<Attraction[]> {
  const data = await runQuery(async () => {
    const supabase = await createClient();
    return supabase.from("attractions").select("*, destinations(*)").eq("status", "published").order("rating_avg", { ascending: false });
  }, attractions);
  const city = String(filters.city ?? "");
  const category = String(filters.category ?? "");
  return data.filter((attraction) => textIncludes(attraction.destinations?.city, city) && arrayIncludes(attraction.category, category));
}

export async function getPublicAttractionBySlugData(slug: string): Promise<Attraction | null> {
  const fallback = attractions.find((item) => item.slug === slug) ?? null;
  return runQuery(async () => {
    const supabase = await createClient();
    return supabase.from("attractions").select("*, destinations(*)").eq("slug", slug).single();
  }, fallback);
}

export async function getPublicGuidesData(filters: PublicFilters = {}): Promise<Guide[]> {
  const data = await runQuery(async () => {
    const supabase = await createClient();
    return supabase.from("guides").select("*").eq("status", "approved").order("rating_avg", { ascending: false });
  }, guides);
  const city = String(filters.city ?? "");
  const language = String(filters.language ?? "");
  const specialty = String(filters.specialty ?? "");
  const maxRate = Number(filters.max_rate || 0);
  return data.filter((guide) =>
    arrayIncludes(guide.service_cities, city) &&
    arrayIncludes(guide.languages, language) &&
    arrayIncludes(guide.specialties, specialty) &&
    (!maxRate || Number(guide.hourly_rate ?? 0) <= maxRate)
  );
}

export async function getPublicServicesData(filters: PublicFilters = {}): Promise<Service[]> {
  const data = await runQuery(async () => {
    const supabase = await createClient();
    return supabase
      .from("services")
      .select("*")
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true });
  }, services);
  const normalized = normalizeServices(data);
  const q = String(filters.q ?? "");
  const city = String(filters.city ?? "");
  const category = String(filters.category ?? "");

  return normalized.filter((service) =>
    (!q || textIncludes(service.title, q) || textIncludes(service.description, q) || arrayIncludes(service.tags, q)) &&
    textIncludes(service.city, city) &&
    textIncludes(service.category, category) &&
    service.status === "published"
  );
}

export async function getPublicMedicalClinicsData(filters: PublicFilters = {}): Promise<MedicalClinic[]> {
  const data = await runQuery(async () => {
    const supabase = await createClient();
    return supabase
      .from("medical_clinics")
      .select("*")
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true });
  }, medicalClinics);
  const normalized = normalizeMedicalClinics(data);
  const q = String(filters.q ?? "");
  const city = String(filters.city ?? "");
  const category = String(filters.category ?? "");
  const language = String(filters.language ?? "");
  const emergency = String(filters.emergency ?? "");

  return normalized.filter((clinic) =>
    (!q || textIncludes(clinic.name, q) || textIncludes(clinic.description, q) || arrayIncludes(clinic.services, q)) &&
    textIncludes(clinic.city, city) &&
    textIncludes(clinic.category, category) &&
    arrayIncludes(clinic.languages, language) &&
    (!emergency || clinic.is_emergency === (emergency === "true")) &&
    clinic.status === "published"
  );
}

export async function getPublicKOLsData(filters: PublicFilters = {}): Promise<KOL[]> {
  const data = await runQuery(async () => {
    const supabase = await createClient();
    return supabase
      .from("kols")
      .select("*, kol_visits(*)")
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true });
  }, kols as unknown as KOL[]);
  const city = String(filters.city ?? "");
  const specialty = String(filters.specialty ?? "");
  const normalized = normalizeKOLs(data).map(enrichKOL);

  return normalized.filter((kol) =>
    textIncludes(kol.city, city) &&
    arrayIncludes(kol.specialty_tags, specialty) &&
    kol.status === "published"
  );
}

export async function getPublicKOLBySlugData(slug: string): Promise<KOL | null> {
  const fallback = kols.find((item) => item.slug === slug) ?? null;
  return runQuery(async () => {
    const supabase = await createClient();
    return supabase.from("kols").select("*, kol_visits(*)").eq("slug", slug).eq("status", "published").maybeSingle();
  }, fallback as KOL | null).then((kol) => {
    const normalized = kol ? normalizeKOLs([kol])[0] : null;
    return normalized ? enrichKOL(normalized) : null;
  });
}

export async function getPublicGuideByIdData(id: string): Promise<(Guide & Record<string, unknown>) | null> {
  const fallback = guides.find((item) => item.id === id) ?? null;
  return runQuery(async () => {
    const supabase = await createClient();
    return supabase.from("guides").select("*, guide_services(*), guide_availability(*)").eq("id", id).single();
  }, fallback);
}

export async function getPublicBlogPostsData(filters: PublicFilters = {}): Promise<BlogPost[]> {
  const data = await runQuery(async () => {
    const supabase = await createClient();
    return supabase.from("blog_posts").select("*").eq("status", "published").order("published_at", { ascending: false });
  }, blogPosts);
  const category = String(filters.category ?? "");
  const tag = String(filters.tag ?? "");
  return data.filter((post) => textIncludes(post.category, category) && arrayIncludes(post.tags, tag));
}

export async function getPublicBlogPostBySlugData(slug: string): Promise<BlogPost | null> {
  const fallback = blogPosts.find((item) => item.slug === slug) ?? null;
  return runQuery(async () => {
    const supabase = await createClient();
    return supabase.from("blog_posts").select("*").eq("slug", slug).single();
  }, fallback);
}

export async function getPublicCityGuideOverridesData() {
  const data = await runQuery(async () => {
    const supabase = await createClient();
    return supabase.from("site_settings").select("value").eq("key", "city_guide_overrides").maybeSingle();
  }, null as { value: unknown } | null);
  return [];
}

export async function getPublicRankingSettingsData() {
  return getPublicRankingConfigsData();
}

const CITY_GUIDE_CACHE_TTL_MS = 5 * 60 * 1000;
let cityGuideRecordsCache: { expiresAt: number; records: unknown[] } | null = null;
let cityGuideRecordsPending: Promise<unknown[]> | null = null;

async function getCachedPublicCityGuideRecords(): Promise<unknown[]> {
  const now = Date.now();
  if (cityGuideRecordsCache && cityGuideRecordsCache.expiresAt > now) return cityGuideRecordsCache.records;
  if (cityGuideRecordsPending) return cityGuideRecordsPending;

  cityGuideRecordsPending = (async () => {
    let records: unknown[] = defaultCityGuideRecords();
    if (hasSupabaseEnv()) {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from("city_guides")
          .select("*, city_guide_translations(*)")
          .eq("status", "published")
          .order("is_featured", { ascending: false })
          .order("sort_order", { ascending: true });
        if (!error && data?.length) records = data;
      } catch {
        records = defaultCityGuideRecords();
      }
    }
    cityGuideRecordsCache = { expiresAt: Date.now() + CITY_GUIDE_CACHE_TTL_MS, records };
    return records;
  })().finally(() => {
    cityGuideRecordsPending = null;
  });

  return cityGuideRecordsPending;
}

export function clearPublicCityGuideCache() {
  cityGuideRecordsCache = null;
  cityGuideRecordsPending = null;
}

export async function getPublicCityGuidesData(locale: SupportedLocale) {
  const records = await getCachedPublicCityGuideRecords();
  const normalized = normalizeCityGuideRecords(records);
  return cityGuideRecordsToGuides(normalized.length ? normalized : defaultCityGuideRecords(), locale);
}

export async function getPublicRankingConfigsData() {
  const data = await runQuery(async () => {
    const supabase = await createClient();
    return supabase
      .from("ranking_configs")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });
  }, [] as unknown[]);
  const configs = normalizeRankingSettings(data);
  if (configs.length) return configs;
  const legacyData = await runQuery(async () => {
    const supabase = await createClient();
    return supabase.from("site_settings").select("value").eq("key", "ranking_settings").maybeSingle();
  }, null as { value: unknown } | null);
  return normalizeRankingSettings(legacyData?.value);
}
