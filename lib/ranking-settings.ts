import type { RankingGroup } from "@/lib/rankings";
import type { SupportedLocale } from "@/lib/i18n/config";
import type { Restaurant } from "@/types";

export const RANKING_SETTINGS_STORAGE_KEY = "vietfood:ranking-settings:v1";

export type SponsoredMode = "include" | "only" | "exclude";
export type RankingStatus = "draft" | "published" | "archived";

export type RankingConfig = {
  id: string;
  ranking_key: string;
  title: string;
  description: string;
  city: string;
  category: string;
  language_code: SupportedLocale | "";
  sponsored_mode: SponsoredMode;
  status: RankingStatus;
  sort_order: number;
  rule: Record<string, unknown>;
};

export type RankingSetting = RankingConfig & {
  enabled?: boolean;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asString(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asStatus(value: unknown): RankingStatus {
  const status = asString(value, "published");
  return status === "draft" || status === "published" || status === "archived" ? status : "published";
}

function asSponsoredMode(value: unknown): SponsoredMode {
  const mode = asString(value, "include");
  return mode === "only" || mode === "exclude" || mode === "include" ? mode : "include";
}

function asLocale(value: unknown): SupportedLocale | "" {
  const locale = asString(value).toLowerCase();
  return ["zh-tw", "zh-cn", "en", "vi", "ko", "ja"].includes(locale) ? locale as SupportedLocale : "";
}

export function normalizeRankingSetting(value: unknown): RankingSetting | null {
  const row = asRecord(value);
  const id = asString(row.id);
  if (!id) return null;
  const legacyEnabled = row.enabled;
  const status = legacyEnabled === false || legacyEnabled === "false" || legacyEnabled === "off" ? "archived" : asStatus(row.status);

  return {
    id,
    ranking_key: asString(row.ranking_key ?? row.rankingKey, id),
    title: asString(row.title),
    description: asString(row.description),
    city: asString(row.city),
    category: asString(row.category),
    language_code: asLocale(row.language_code ?? row.locale),
    sponsored_mode: asSponsoredMode(row.sponsored_mode ?? row.sponsoredMode),
    status,
    enabled: status === "published",
    sort_order: asNumber(row.sort_order ?? row.sortOrder, 0),
    rule: asRecord(row.rule)
  };
}

export function normalizeRankingSettings(value: unknown): RankingSetting[] {
  return Array.isArray(value) ? value.map(normalizeRankingSetting).filter((item): item is RankingSetting => Boolean(item)) : [];
}

export const normalizeRankingConfigs = normalizeRankingSettings;

function textMatches(value: unknown, keyword?: string) {
  if (!keyword) return true;
  const text = String(value ?? "").toLowerCase();
  const target = keyword.toLowerCase();
  return text.includes(target) || target.includes(text);
}

function listMatches(values: unknown, keyword?: string) {
  if (!keyword) return true;
  return Array.isArray(values) && values.some((value) => textMatches(value, keyword));
}

function restaurantMatchesConfig(restaurant: Restaurant, config: RankingSetting) {
  if (config.city && !textMatches(restaurant.destinations?.city, config.city) && !textMatches(restaurant.district, config.city)) return false;
  if (config.category && !listMatches(restaurant.cuisine_type, config.category) && !listMatches(restaurant.features, config.category)) return false;
  if (config.sponsored_mode === "only" && !restaurant.sponsored) return false;
  if (config.sponsored_mode === "exclude" && restaurant.sponsored) return false;
  return true;
}

function configMatchesContext(config: RankingSetting, context: { locale?: SupportedLocale; city?: string; category?: string }) {
  if (config.status !== "published") return false;
  if (context.locale && config.language_code && config.language_code !== context.locale) return false;
  if (context.city && config.city && !textMatches(config.city, context.city)) return false;
  if (context.category && config.category && !textMatches(config.category, context.category)) return false;
  return true;
}

function configMatchesScope(config: RankingSetting, context: { locale?: SupportedLocale; city?: string; category?: string }) {
  if (context.locale && config.language_code && config.language_code !== context.locale) return false;
  if (context.city && config.city && !textMatches(config.city, context.city)) return false;
  if (context.category && config.category && !textMatches(config.category, context.category)) return false;
  return true;
}

export function applyRankingSettings(
  groups: RankingGroup[],
  settings: RankingSetting[],
  context: { locale?: SupportedLocale; city?: string; category?: string } = {}
) {
  if (!settings.length) return groups;

  const matchingSettings = settings.filter((setting) => configMatchesContext(setting, context));
  if (!matchingSettings.length) {
    return settings.some((setting) => configMatchesScope(setting, context)) ? [] : groups;
  }
  const byId = new Map(groups.map((group) => [group.id, group]));
  const configuredGroups: RankingGroup[] = [];

  matchingSettings.forEach((setting) => {
    const group = byId.get(setting.ranking_key || setting.id);
    if (!group) return;
    configuredGroups.push({
      ...group,
      id: setting.id,
      ranking_key: setting.ranking_key,
      title: setting.title || group.title,
      description: setting.description || group.description,
      restaurants: group.restaurants.filter((restaurant) => restaurantMatchesConfig(restaurant, setting)),
      city: setting.city,
      category: setting.category,
      language_code: setting.language_code,
      sponsored_mode: setting.sponsored_mode,
      enabled: true,
      sort_order: setting.sort_order
    });
  });

  return configuredGroups.sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));
}

export function rankingConfigPayload(config: RankingConfig) {
  return {
    id: config.id,
    ranking_key: config.ranking_key || config.id,
    title: config.title,
    description: config.description || null,
    city: config.city || null,
    category: config.category || null,
    language_code: config.language_code || null,
    sponsored_mode: config.sponsored_mode,
    status: config.status,
    sort_order: config.sort_order,
    rule: config.rule ?? {},
    updated_at: new Date().toISOString()
  };
}
