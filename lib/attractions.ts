import type { Attraction, Destination } from "@/types";

export const ATTRACTION_STORAGE_KEY = "vietfood_admin_attractions";

export const attractionCategories = ["市場", "小吃", "夜生活", "海灘", "文化", "購物", "親子", "景觀"];

export const attractionDestinationOptions = [
  { id: "hcm", city: "Ho Chi Minh City", slug: "ho-chi-minh", region: "south", latitude: 10.7769, longitude: 106.7009 },
  { id: "hanoi", city: "Hanoi", slug: "hanoi", region: "north", latitude: 21.0278, longitude: 105.8342 },
  { id: "danang", city: "Da Nang", slug: "da-nang", region: "central", latitude: 16.0544, longitude: 108.2022 },
  { id: "hoian", city: "Hoi An", slug: "hoi-an", region: "central", latitude: 15.8801, longitude: 108.338 }
] satisfies Array<Omit<Destination, "cover_image_url" | "status">>;

const destinationById = Object.fromEntries(
  attractionDestinationOptions.map((destination) => [
    destination.id,
    {
      ...destination,
      cover_image_url: null,
      status: "published"
    }
  ])
) as Record<string, Destination>;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function stringArray(value: unknown) {
  if (Array.isArray(value)) return value.map(stringValue).filter(Boolean);
  return stringValue(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeDestination(value: unknown): Destination | null {
  const record = asRecord(value);
  const id = stringValue(record.id);
  const city = stringValue(record.city);
  const slug = stringValue(record.slug);
  if (!id || !city || !slug) return null;
  const region = stringValue(record.region);

  return {
    id,
    city,
    slug,
    region: region === "north" || region === "central" || region === "south" ? region : "south",
    latitude: numberValue(record.latitude),
    longitude: numberValue(record.longitude),
    cover_image_url: stringValue(record.cover_image_url) || null,
    status: stringValue(record.status) || "published"
  };
}

function destinationIdFrom(record: Record<string, unknown>) {
  const direct = stringValue(record.destination_id);
  if (direct) return direct;

  const city = stringValue(record.city) || stringValue(asRecord(record.destinations).city);
  if (!city) return null;

  const cityLower = city.toLowerCase();
  return attractionDestinationOptions.find((destination) =>
    destination.city.toLowerCase().includes(cityLower) || cityLower.includes(destination.city.toLowerCase())
  )?.id ?? null;
}

export function slugifyAttractionName(value: string) {
  const cleaned = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || `attraction-${Date.now()}`;
}

export function normalizeAttraction(value: unknown): Attraction {
  const record = asRecord(value);
  const name = stringValue(record.name) || "未命名景點";
  const slug = stringValue(record.slug) || slugifyAttractionName(name);
  const destinationId = destinationIdFrom(record);
  const destination = normalizeDestination(record.destinations) ?? (destinationId ? destinationById[destinationId] ?? null : null);

  return {
    id: stringValue(record.id) || `local-${slug}`,
    destination_id: destinationId,
    name,
    slug,
    category: stringArray(record.category),
    address: stringValue(record.address) || null,
    latitude: numberValue(record.latitude),
    longitude: numberValue(record.longitude),
    cover_image_url: stringValue(record.cover_image_url) || null,
    rating_avg: numberValue(record.rating_avg),
    status: stringValue(record.status) || "published",
    destinations: destination
  };
}

export function normalizeAttractions(values: unknown): Attraction[] {
  if (!Array.isArray(values)) return [];
  return values.map(normalizeAttraction);
}

export function mergeAttractions(primary: Attraction[], secondary: Attraction[]) {
  const merged = new Map<string, Attraction>();

  primary.forEach((attraction) => merged.set(attraction.slug || attraction.id, attraction));
  secondary.forEach((attraction) => merged.set(attraction.slug || attraction.id, attraction));

  return Array.from(merged.values()).sort((a, b) =>
    Number(b.rating_avg ?? 0) - Number(a.rating_avg ?? 0) || a.name.localeCompare(b.name)
  );
}
