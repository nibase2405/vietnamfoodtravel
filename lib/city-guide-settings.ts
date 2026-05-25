import type { CityGuide } from "@/lib/city-guides";

export const CITY_GUIDE_SETTINGS_STORAGE_KEY = "vietfood:city-guide-settings:v1";

export type CityGuideOverride = {
  slug: string;
  summary?: string;
  cover_image_url?: string;
  foodThemes?: string[];
  districts?: string[];
  suggestedPlan?: string[];
  seoKeywords?: string[];
  status?: "published" | "draft" | "archived";
  is_featured?: boolean;
  sort_order?: number;
};

function splitList(value: unknown) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeCityGuideOverride(value: unknown): CityGuideOverride | null {
  const row = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const slug = String(row.slug ?? "").trim();
  if (!slug) return null;

  return {
    slug,
    summary: String(row.summary ?? "").trim() || undefined,
    cover_image_url: String(row.cover_image_url ?? row.coverImageUrl ?? "").trim() || undefined,
    foodThemes: splitList(row.foodThemes ?? row.food_themes),
    districts: splitList(row.districts),
    suggestedPlan: splitList(row.suggestedPlan ?? row.suggested_plan),
    seoKeywords: splitList(row.seoKeywords ?? row.seo_keywords),
    status: String(row.status ?? "published") as CityGuideOverride["status"],
    is_featured: row.is_featured === true || row.is_featured === "true" || row.isFeatured === true,
    sort_order: numberValue(row.sort_order ?? row.sortOrder, 0)
  };
}

export function normalizeCityGuideOverrides(value: unknown): CityGuideOverride[] {
  return Array.isArray(value) ? value.map(normalizeCityGuideOverride).filter((item): item is CityGuideOverride => Boolean(item)) : [];
}

export function applyCityGuideOverrides(guides: CityGuide[], overrides: CityGuideOverride[]) {
  const bySlug = new Map(overrides.map((override) => [override.slug, override]));

  return guides
    .map((guide) => {
      const override = bySlug.get(guide.slug);
      if (!override) return { ...guide, status: "published", is_featured: false, sort_order: 0 };

      return {
        ...guide,
        summary: override.summary || guide.summary,
        cover_image_url: override.cover_image_url || guide.cover_image_url,
        foodThemes: override.foodThemes?.length ? override.foodThemes : guide.foodThemes,
        districts: override.districts?.length ? override.districts : guide.districts,
        suggestedPlan: override.suggestedPlan?.length ? override.suggestedPlan : guide.suggestedPlan,
        seoKeywords: override.seoKeywords?.length ? override.seoKeywords : guide.seoKeywords,
        status: override.status ?? "published",
        is_featured: Boolean(override.is_featured),
        sort_order: override.sort_order ?? 0
      };
    })
    .filter((guide) => guide.status !== "archived")
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order || a.city.localeCompare(b.city));
}
