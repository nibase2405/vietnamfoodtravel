export const MENU_OVERRIDES_STORAGE_KEY = "vietfood:restaurant-menu:v1";

export type DisplayMenuItem = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  currency: string;
  category: string;
  imageUrl: string;
  translatedName: string;
  tags: string[];
  spicyLevel: number;
  isVegetarian: boolean;
  allergens: string[];
};

export type RestaurantMenuOverride = {
  menuImages: string[];
  menuItems: unknown[];
  updatedAt: string;
};

const mojibakePattern = /[\uE000-\uF8FF�]|蝮|銵|摰|閰|撱|隤|繚|憭|撠|銝|瘝|頞|嚗|蝢|蝭|鞈|隢|甇|憛|廕|廙/;

export function isProbablyGarbled(value: unknown) {
  return typeof value === "string" && mojibakePattern.test(value);
}

export function cleanMenuText(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed || isProbablyGarbled(trimmed)) return fallback;
  return trimmed;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => cleanMenuText(item)).filter(Boolean) : [];
}

function getTranslation(value: unknown) {
  const translations = asRecord(value);
  return cleanMenuText(translations["zh-TW"]) || cleanMenuText(translations.en) || cleanMenuText(translations.vi);
}

export function normalizeMenuImages(raw: unknown) {
  return Array.isArray(raw) ? raw.map((item) => cleanMenuText(item)).filter(Boolean) : [];
}

export function normalizeMenuItems(raw: unknown): DisplayMenuItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item, index) => {
      const row = asRecord(item);
      const name = cleanMenuText(row.name) || cleanMenuText(row.title);
      if (!name || row.is_active === false) return null;

      const translatedName = getTranslation(row.translations) || cleanMenuText(row.translated_name);
      const priceValue = Number(row.price ?? row.price_vnd ?? 0);

      return {
        id: cleanMenuText(row.id) || `${name}-${index}`,
        name,
        description: cleanMenuText(row.description),
        price: Number.isFinite(priceValue) && priceValue > 0 ? priceValue : null,
        currency: cleanMenuText(row.currency, "VND"),
        category: cleanMenuText(row.category, "招牌菜"),
        imageUrl: cleanMenuText(row.image_url) || cleanMenuText(row.photo_url),
        translatedName,
        tags: asStringArray(row.tags),
        spicyLevel: Number(row.spicy_level ?? 0) || 0,
        isVegetarian: Boolean(row.is_vegetarian),
        allergens: asStringArray(row.allergens)
      } satisfies DisplayMenuItem;
    })
    .filter((item): item is DisplayMenuItem => Boolean(item));
}

export function formatMenuPrice(price: number | null, currency: string) {
  if (!price) return "價格待確認";
  return `${new Intl.NumberFormat("vi-VN").format(price)} ${currency || "VND"}`;
}
