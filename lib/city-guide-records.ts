import { attractions, destinations, medicalClinics, restaurants, services } from "@/lib/data/mock";
import { getCityGuides, type CityGuide } from "@/lib/city-guides";
import type { SupportedLocale } from "@/lib/i18n/config";
import type { Attraction, Destination, MedicalClinic, Restaurant, Service } from "@/types";

export type CityGuideStatus = "draft" | "published" | "archived";
export type CityGuideRegion = "north" | "central" | "south";

export type CityGuideTranslationContent = {
  foodThemes?: string[];
  districts?: string[];
  suggestedPlan?: string[];
  seoKeywords?: string[];
  body?: string;
};

export type CityGuideTranslationRecord = {
  id?: string;
  city_guide_id?: string;
  language_code: SupportedLocale;
  title: string;
  summary: string;
  seo_title: string;
  seo_description: string;
  content: CityGuideTranslationContent;
};

export type CityGuideRecord = {
  id: string;
  destination_slug: string;
  city: string;
  slug: string;
  region: CityGuideRegion;
  latitude: number;
  longitude: number;
  cover_image_url: string;
  food_themes: string[];
  districts: string[];
  suggested_plan: string[];
  seo_keywords: string[];
  status: CityGuideStatus;
  is_featured: boolean;
  sort_order: number;
  translations: CityGuideTranslationRecord[];
  created_at?: string | null;
  updated_at?: string | null;
};

const languageFallbacks: SupportedLocale[] = ["zh-tw", "zh-cn", "en", "vi", "ko", "ja"];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asString(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function asBoolean(value: unknown) {
  return value === true || value === "true" || value === "on" || value === 1 || value === "1";
}

function asList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function asLocale(value: unknown): SupportedLocale {
  const locale = asString(value, "zh-tw").toLowerCase();
  return languageFallbacks.includes(locale as SupportedLocale) ? locale as SupportedLocale : "zh-tw";
}

function asRegion(value: unknown, fallback: CityGuideRegion = "south"): CityGuideRegion {
  const region = asString(value, fallback);
  return region === "north" || region === "central" || region === "south" ? region : fallback;
}

function asStatus(value: unknown, fallback: CityGuideStatus = "published"): CityGuideStatus {
  const status = asString(value, fallback);
  return status === "draft" || status === "published" || status === "archived" ? status : fallback;
}

function asContent(value: unknown): CityGuideTranslationContent {
  const row = asRecord(value);
  return {
    foodThemes: asList(row.foodThemes ?? row.food_themes),
    districts: asList(row.districts),
    suggestedPlan: asList(row.suggestedPlan ?? row.suggested_plan),
    seoKeywords: asList(row.seoKeywords ?? row.seo_keywords),
    body: asString(row.body)
  };
}

function titleForGuide(guide: CityGuide) {
  return guide.title || `${guide.city} Food Guide`;
}

function matchesCity(value: string | null | undefined, city: string, id: string, slug: string) {
  const text = String(value ?? "").toLowerCase();
  const cityText = city.toLowerCase();
  return text.includes(cityText) || cityText.includes(text) || text.includes(id.toLowerCase()) || text.includes(slug.toLowerCase());
}

function relatedDestination(record: CityGuideRecord): Destination | undefined {
  return destinations.find((item) =>
    item.id === record.destination_slug ||
    item.slug === record.destination_slug ||
    item.slug === record.slug ||
    matchesCity(item.city, record.city, record.id, record.slug)
  );
}

function relatedRestaurants(record: CityGuideRecord, destination?: Destination): Restaurant[] {
  return restaurants.filter((item) =>
    item.destination_id === destination?.id ||
    item.destination_id === record.destination_slug ||
    matchesCity(item.destinations?.city, record.city, record.id, record.slug)
  );
}

function relatedAttractions(record: CityGuideRecord, destination?: Destination): Attraction[] {
  return attractions.filter((item) =>
    item.destination_id === destination?.id ||
    item.destination_id === record.destination_slug ||
    matchesCity(item.destinations?.city, record.city, record.id, record.slug)
  );
}

function relatedServices(record: CityGuideRecord): Service[] {
  return services.filter((item) => matchesCity(item.city, record.city, record.id, record.slug) || item.city === null);
}

function relatedClinics(record: CityGuideRecord): MedicalClinic[] {
  return medicalClinics.filter((item) => matchesCity(item.city, record.city, record.id, record.slug));
}

export function normalizeCityGuideTranslation(value: unknown): CityGuideTranslationRecord | null {
  const row = asRecord(value);
  const language_code = asLocale(row.language_code ?? row.locale);
  return {
    id: asString(row.id) || undefined,
    city_guide_id: asString(row.city_guide_id) || undefined,
    language_code,
    title: asString(row.title),
    summary: asString(row.summary),
    seo_title: asString(row.seo_title ?? row.seoTitle),
    seo_description: asString(row.seo_description ?? row.seoDescription),
    content: asContent(row.content)
  };
}

export function normalizeCityGuideRecord(value: unknown): CityGuideRecord | null {
  const row = asRecord(value);
  const slug = asString(row.slug);
  const city = asString(row.city);
  if (!slug || !city) return null;
  const fallbackGuide = getCityGuides().find((guide) => guide.slug === slug);
  const nestedTranslations = row.city_guide_translations ?? row.translations;
  const translations = Array.isArray(nestedTranslations)
    ? nestedTranslations.map(normalizeCityGuideTranslation).filter((item): item is CityGuideTranslationRecord => Boolean(item))
    : [];

  return {
    id: asString(row.id, fallbackGuide?.id ?? slug),
    destination_slug: asString(row.destination_slug ?? row.destinationSlug, fallbackGuide?.destination?.slug ?? fallbackGuide?.id ?? ""),
    city,
    slug,
    region: asRegion(row.region, fallbackGuide?.region ?? "south"),
    latitude: asNumber(row.latitude, fallbackGuide?.latitude ?? 0),
    longitude: asNumber(row.longitude, fallbackGuide?.longitude ?? 0),
    cover_image_url: asString(row.cover_image_url ?? row.coverImageUrl, fallbackGuide?.cover_image_url ?? ""),
    food_themes: asList(row.food_themes ?? row.foodThemes).length ? asList(row.food_themes ?? row.foodThemes) : fallbackGuide?.foodThemes ?? [],
    districts: asList(row.districts).length ? asList(row.districts) : fallbackGuide?.districts ?? [],
    suggested_plan: asList(row.suggested_plan ?? row.suggestedPlan).length ? asList(row.suggested_plan ?? row.suggestedPlan) : fallbackGuide?.suggestedPlan ?? [],
    seo_keywords: asList(row.seo_keywords ?? row.seoKeywords).length ? asList(row.seo_keywords ?? row.seoKeywords) : fallbackGuide?.seoKeywords ?? [],
    status: asStatus(row.status),
    is_featured: asBoolean(row.is_featured ?? row.isFeatured),
    sort_order: asNumber(row.sort_order ?? row.sortOrder, 0),
    translations,
    created_at: asString(row.created_at) || null,
    updated_at: asString(row.updated_at) || null
  };
}

export function normalizeCityGuideRecords(value: unknown): CityGuideRecord[] {
  return Array.isArray(value)
    ? value.map(normalizeCityGuideRecord).filter((item): item is CityGuideRecord => Boolean(item))
    : [];
}

export function defaultCityGuideRecords(): CityGuideRecord[] {
  return getCityGuides().map((guide, index) => ({
    id: guide.id,
    destination_slug: guide.destination?.slug ?? guide.id,
    city: guide.city,
    slug: guide.slug,
    region: guide.region,
    latitude: guide.latitude,
    longitude: guide.longitude,
    cover_image_url: guide.cover_image_url,
    food_themes: guide.foodThemes,
    districts: guide.districts,
    suggested_plan: guide.suggestedPlan,
    seo_keywords: guide.seoKeywords,
    status: "published",
    is_featured: index < 3,
    sort_order: index,
    translations: [
      {
        language_code: "en",
        title: titleForGuide(guide),
        summary: guide.summary,
        seo_title: titleForGuide(guide),
        seo_description: guide.summary,
        content: {}
      },
      {
        language_code: "zh-tw",
        title: `${guide.city} 城市美食攻略`,
        summary: guide.summary,
        seo_title: `${guide.city} 城市美食攻略`,
        seo_description: guide.summary,
        content: {}
      }
    ]
  }));
}

export function pickCityGuideTranslation(record: CityGuideRecord, locale: SupportedLocale) {
  return [
    record.translations.find((item) => item.language_code === locale),
    record.translations.find((item) => item.language_code === "zh-tw"),
    record.translations.find((item) => item.language_code === "en"),
    ...languageFallbacks.map((language) => record.translations.find((item) => item.language_code === language))
  ].find(Boolean) ?? null;
}

function localizedList(localized: string[] | undefined, fallback: string[]) {
  return localized?.length ? localized : fallback;
}

export function cityGuideRecordToGuide(record: CityGuideRecord, locale: SupportedLocale): CityGuide {
  const base = getCityGuides().find((guide) => guide.slug === record.slug);
  const translation = pickCityGuideTranslation(record, locale);
  const destination = relatedDestination(record);
  const content = translation?.content ?? {};

  return {
    id: record.id,
    city: record.city,
    title: translation?.title || base?.title || record.city,
    slug: record.slug,
    region: record.region,
    latitude: record.latitude || base?.latitude || destination?.latitude || 0,
    longitude: record.longitude || base?.longitude || destination?.longitude || 0,
    cover_image_url: record.cover_image_url || base?.cover_image_url || destination?.cover_image_url || "",
    summary: translation?.summary || base?.summary || "",
    seoTitle: translation?.seo_title || translation?.title || record.city,
    seoDescription: translation?.seo_description || translation?.summary || base?.summary || "",
    foodThemes: localizedList(content.foodThemes, record.food_themes.length ? record.food_themes : base?.foodThemes ?? []),
    districts: localizedList(content.districts, record.districts.length ? record.districts : base?.districts ?? []),
    suggestedPlan: localizedList(content.suggestedPlan, record.suggested_plan.length ? record.suggested_plan : base?.suggestedPlan ?? []),
    seoKeywords: localizedList(content.seoKeywords, record.seo_keywords.length ? record.seo_keywords : base?.seoKeywords ?? []),
    languageCode: translation?.language_code,
    status: record.status,
    is_featured: record.is_featured,
    sort_order: record.sort_order,
    destination,
    restaurants: base?.restaurants ?? relatedRestaurants(record, destination),
    attractions: base?.attractions ?? relatedAttractions(record, destination),
    services: base?.services ?? relatedServices(record),
    clinics: base?.clinics ?? relatedClinics(record)
  };
}

export function cityGuideRecordsToGuides(records: CityGuideRecord[], locale: SupportedLocale): CityGuide[] {
  return records
    .filter((record) => record.status !== "archived")
    .map((record) => cityGuideRecordToGuide(record, locale))
    .filter((guide) => guide.status === "published")
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) || a.city.localeCompare(b.city));
}

export function cityGuideCorePayload(record: CityGuideRecord) {
  const hasUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(record.id);
  return {
    id: hasUuid ? record.id : undefined,
    destination_slug: record.destination_slug || null,
    city: record.city,
    slug: record.slug,
    region: record.region,
    latitude: record.latitude || null,
    longitude: record.longitude || null,
    cover_image_url: record.cover_image_url || null,
    food_themes: record.food_themes,
    districts: record.districts,
    suggested_plan: record.suggested_plan,
    seo_keywords: record.seo_keywords,
    status: record.status,
    is_featured: record.is_featured,
    sort_order: record.sort_order,
    updated_at: new Date().toISOString()
  };
}

export function cityGuideTranslationPayload(translation: CityGuideTranslationRecord, cityGuideId: string) {
  return {
    city_guide_id: cityGuideId,
    language_code: translation.language_code,
    title: translation.title || null,
    summary: translation.summary || null,
    seo_title: translation.seo_title || null,
    seo_description: translation.seo_description || null,
    content: translation.content ?? {},
    updated_at: new Date().toISOString()
  };
}
