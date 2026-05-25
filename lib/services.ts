import type { Service } from "@/types";

export const SERVICE_STORAGE_KEY = "vietfood:services:v1";

export const serviceCategories = ["旅遊服務", "交通接送", "簽證文件", "美食導覽", "通訊上網", "商家服務"];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asNumber(value: unknown, fallback: number | null = null) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function asBoolean(value: unknown) {
  return value === true || value === "true" || value === "on" || value === "1";
}

function asStringArray(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function slugifyServiceTitle(title: string) {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return slug || `service-${Date.now()}`;
}

export function normalizeService(value: unknown): Service {
  const row = asRecord(value);
  const title = String(row.title ?? row.name ?? "未命名服務").trim();
  const slug = String(row.slug ?? "").trim() || slugifyServiceTitle(title);

  return {
    id: String(row.id ?? slug),
    title,
    slug,
    category: String(row.category ?? "旅遊服務").trim(),
    city: String(row.city ?? "").trim() || null,
    description: String(row.description ?? "").trim(),
    price_from: asNumber(row.price_from ?? row.priceFrom),
    currency: String(row.currency ?? "USD").trim(),
    duration: String(row.duration ?? "").trim() || null,
    cover_image_url: String(row.cover_image_url ?? row.coverImageUrl ?? "").trim() || null,
    status: String(row.status ?? "published").trim(),
    is_featured: asBoolean(row.is_featured ?? row.isFeatured),
    sort_order: asNumber(row.sort_order ?? row.sortOrder, 0) ?? 0,
    cta_label: String(row.cta_label ?? row.ctaLabel ?? "預約諮詢").trim() || null,
    cta_href: String(row.cta_href ?? row.ctaHref ?? "/contact").trim() || null,
    tags: asStringArray(row.tags),
    created_at: String(row.created_at ?? "").trim() || null,
    updated_at: String(row.updated_at ?? "").trim() || null
  };
}

export function normalizeServices(value: unknown): Service[] {
  return Array.isArray(value) ? value.map(normalizeService) : [];
}

export function mergeServices(initialServices: Service[], localServices: Service[]) {
  const bySlug = new Map<string, Service>();
  [...initialServices, ...localServices].forEach((service) => bySlug.set(service.slug, service));
  return [...bySlug.values()]
    .filter((service) => service.status !== "archived")
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order || a.title.localeCompare(b.title));
}
