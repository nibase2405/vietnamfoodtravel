import { attractions, restaurants } from "@/lib/data/mock";
import type { KOL, KOLVisit, MapMarker } from "@/types";

export const KOL_STORAGE_KEY = "vietfood:kols:v1";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringValue(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function booleanValue(value: unknown) {
  return value === true || value === "true" || value === "on" || value === 1 || value === "1";
}

function listValue(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
}

function socialLinks(value: unknown): Record<string, string> {
  const row = asRecord(value);
  return Object.fromEntries(Object.entries(row).map(([key, link]) => [key, String(link ?? "").trim()]).filter(([, link]) => link));
}

export function slugifyKOLName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || `kol-${Date.now()}`;
}

export function normalizeKOLVisit(value: unknown): KOLVisit {
  const row = asRecord(value);
  const entityType = stringValue(row.entity_type ?? row.entityType, "custom");
  const visitType = stringValue(row.visit_type ?? row.visitType, entityType === "attraction" ? "attraction" : "food");
  return {
    id: stringValue(row.id, `visit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    kol_id: stringValue(row.kol_id ?? row.kolId) || null,
    entity_type: entityType === "restaurant" || entityType === "attraction" ? entityType : "custom",
    visit_type: visitType === "attraction" ? "attraction" : "food",
    restaurant_slug: stringValue(row.restaurant_slug ?? row.restaurantSlug) || null,
    attraction_slug: stringValue(row.attraction_slug ?? row.attractionSlug) || null,
    title: stringValue(row.title),
    description: stringValue(row.description) || null,
    address: stringValue(row.address) || null,
    city: stringValue(row.city) || null,
    latitude: row.latitude === null || row.latitude === undefined || row.latitude === "" ? null : numberValue(row.latitude),
    longitude: row.longitude === null || row.longitude === undefined || row.longitude === "" ? null : numberValue(row.longitude),
    cover_image_url: stringValue(row.cover_image_url ?? row.coverImageUrl) || null,
    rating: row.rating === null || row.rating === undefined || row.rating === "" ? null : numberValue(row.rating),
    content_url: stringValue(row.content_url ?? row.contentUrl) || null,
    visited_at: stringValue(row.visited_at ?? row.visitedAt) || null,
    status: stringValue(row.status, "published"),
    sort_order: numberValue(row.sort_order ?? row.sortOrder, 0),
    created_at: stringValue(row.created_at) || null,
    updated_at: stringValue(row.updated_at) || null
  };
}

export function normalizeKOL(value: unknown): KOL {
  const row = asRecord(value);
  const name = stringValue(row.name, "KOL");
  const nestedVisits = row.kol_visits ?? row.visits;
  const links = row.social_links ?? {
    instagram: row.instagram_url,
    youtube: row.youtube_url,
    tiktok: row.tiktok_url,
    website: row.website_url
  };
  return {
    id: stringValue(row.id, `local-${Date.now()}`),
    name,
    slug: stringValue(row.slug, slugifyKOLName(name)),
    handle: stringValue(row.handle) || null,
    avatar_url: stringValue(row.avatar_url ?? row.avatarUrl) || null,
    cover_image_url: stringValue(row.cover_image_url ?? row.coverImageUrl) || null,
    bio: stringValue(row.bio) || null,
    city: stringValue(row.city) || null,
    languages: listValue(row.languages),
    specialty_tags: listValue(row.specialty_tags ?? row.specialtyTags),
    social_links: socialLinks(links),
    follower_count: numberValue(row.follower_count ?? row.followerCount, 0),
    status: stringValue(row.status, "published"),
    is_featured: booleanValue(row.is_featured ?? row.isFeatured),
    sort_order: numberValue(row.sort_order ?? row.sortOrder, 0),
    visits: Array.isArray(nestedVisits) ? nestedVisits.map(normalizeKOLVisit) : [],
    created_at: stringValue(row.created_at) || null,
    updated_at: stringValue(row.updated_at) || null
  };
}

export function normalizeKOLs(value: unknown): KOL[] {
  return Array.isArray(value) ? value.map(normalizeKOL) : [];
}

export function mergeKOLs(base: KOL[], additions: KOL[]) {
  const bySlug = new Map(base.map((kol) => [kol.slug, kol]));
  additions.forEach((kol) => bySlug.set(kol.slug, kol));
  return Array.from(bySlug.values()).sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order || a.name.localeCompare(b.name));
}

function enrichedVisit(visit: KOLVisit): KOLVisit {
  if (visit.entity_type === "restaurant" && visit.restaurant_slug) {
    const restaurant = restaurants.find((item) => item.slug === visit.restaurant_slug);
    if (restaurant) {
      return {
        ...visit,
        title: visit.title || restaurant.name,
        description: visit.description || restaurant.description || null,
        address: visit.address || restaurant.address,
        city: visit.city || restaurant.destinations?.city || null,
        latitude: visit.latitude ?? restaurant.latitude,
        longitude: visit.longitude ?? restaurant.longitude,
        cover_image_url: visit.cover_image_url || restaurant.cover_image_url
      };
    }
  }
  if (visit.entity_type === "attraction" && visit.attraction_slug) {
    const attraction = attractions.find((item) => item.slug === visit.attraction_slug);
    if (attraction) {
      return {
        ...visit,
        title: visit.title || attraction.name,
        address: visit.address || attraction.address,
        city: visit.city || attraction.destinations?.city || null,
        latitude: visit.latitude ?? attraction.latitude,
        longitude: visit.longitude ?? attraction.longitude,
        cover_image_url: visit.cover_image_url || attraction.cover_image_url
      };
    }
  }
  return visit;
}

export function enrichKOL(kol: KOL): KOL {
  return {
    ...kol,
    visits: (kol.visits ?? [])
      .map(enrichedVisit)
      .filter((visit) => visit.status !== "archived")
      .sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title))
  };
}

export function kolVisitMarkers(kols: KOL[], selectedKolSlug?: string): MapMarker[] {
  return kols
    .filter((kol) => !selectedKolSlug || kol.slug === selectedKolSlug)
    .flatMap((kol) => (kol.visits ?? []).map((visit) => ({ kol, visit })))
    .filter(({ visit }) => typeof visit.latitude === "number" && typeof visit.longitude === "number")
    .map(({ kol, visit }) => ({
      id: `${kol.slug}-${visit.id}`,
      title: `${kol.name}: ${visit.title}`,
      subtitle: visit.address ?? visit.city ?? undefined,
      latitude: visit.latitude!,
      longitude: visit.longitude!,
      href: visit.entity_type === "restaurant" && visit.restaurant_slug
        ? `/restaurants/${visit.restaurant_slug}`
        : visit.entity_type === "attraction" && visit.attraction_slug
          ? `/attractions/${visit.attraction_slug}`
          : undefined,
      type: visit.visit_type === "attraction" ? "attraction" : "restaurant"
    }));
}

export function kolCorePayload(kol: KOL) {
  const hasUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(kol.id);
  return {
    id: hasUuid ? kol.id : undefined,
    name: kol.name,
    slug: kol.slug,
    handle: kol.handle || null,
    avatar_url: kol.avatar_url || null,
    cover_image_url: kol.cover_image_url || null,
    bio: kol.bio || null,
    city: kol.city || null,
    languages: kol.languages ?? [],
    specialty_tags: kol.specialty_tags ?? [],
    social_links: kol.social_links ?? {},
    follower_count: kol.follower_count ?? 0,
    status: kol.status,
    is_featured: kol.is_featured,
    sort_order: kol.sort_order,
    updated_at: new Date().toISOString()
  };
}

export function kolVisitPayload(visit: KOLVisit, kolId: string) {
  const hasUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visit.id);
  return {
    id: hasUuid ? visit.id : undefined,
    kol_id: kolId,
    entity_type: visit.entity_type,
    visit_type: visit.visit_type,
    restaurant_slug: visit.restaurant_slug || null,
    attraction_slug: visit.attraction_slug || null,
    title: visit.title,
    description: visit.description || null,
    address: visit.address || null,
    city: visit.city || null,
    latitude: visit.latitude ?? null,
    longitude: visit.longitude ?? null,
    cover_image_url: visit.cover_image_url || null,
    rating: visit.rating ?? null,
    content_url: visit.content_url || null,
    visited_at: visit.visited_at || null,
    status: visit.status,
    sort_order: visit.sort_order,
    updated_at: new Date().toISOString()
  };
}
