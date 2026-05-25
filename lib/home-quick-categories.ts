import type { HomeQuickCategory } from "@/types";

export const HOME_QUICK_CATEGORY_STORAGE_KEY = "vietfood:home-quick-categories:v1";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function asBoolean(value: unknown) {
  return value === true || value === "true" || value === "on" || value === "1";
}

export function slugifyHomeQuickCategory(title: string) {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return slug || `home-category-${Date.now()}`;
}

export function normalizeHomeQuickCategory(value: unknown): HomeQuickCategory {
  const row = asRecord(value);
  const title = String(row.title ?? row.name ?? "未命名分類").trim();
  const slug = String(row.slug ?? "").trim() || slugifyHomeQuickCategory(title);

  return {
    id: String(row.id ?? slug),
    title,
    slug,
    description: String(row.description ?? "").trim(),
    href: String(row.href ?? row.url ?? "/food-map").trim() || "/food-map",
    status: String(row.status ?? "published").trim(),
    is_featured: asBoolean(row.is_featured ?? row.isFeatured),
    sort_order: asNumber(row.sort_order ?? row.sortOrder, 0),
    created_at: String(row.created_at ?? "").trim() || null,
    updated_at: String(row.updated_at ?? "").trim() || null
  };
}

export function normalizeHomeQuickCategories(value: unknown): HomeQuickCategory[] {
  return Array.isArray(value) ? value.map(normalizeHomeQuickCategory) : [];
}

export function mergeHomeQuickCategories(initialCategories: HomeQuickCategory[], localCategories: HomeQuickCategory[]) {
  const bySlug = new Map<string, HomeQuickCategory>();
  [...initialCategories, ...localCategories].forEach((category) => bySlug.set(category.slug, category));
  return [...bySlug.values()]
    .filter((category) => category.status !== "archived")
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order || a.title.localeCompare(b.title));
}
