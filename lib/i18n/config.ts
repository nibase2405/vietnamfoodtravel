export const supportedLocales = ["zh-tw", "zh-cn", "en", "vi", "ko", "ja"] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = "zh-tw";

export const htmlLangByLocale: Record<SupportedLocale, string> = {
  "zh-tw": "zh-TW",
  "zh-cn": "zh-CN",
  en: "en",
  vi: "vi",
  ko: "ko",
  ja: "ja"
};

export function isSupportedLocale(value: string | undefined | null): value is SupportedLocale {
  return Boolean(value && supportedLocales.includes(value.toLowerCase() as SupportedLocale));
}

export function normalizeLocale(value: string | undefined | null): SupportedLocale {
  const lowerValue = value?.toLowerCase();
  return isSupportedLocale(lowerValue) ? lowerValue : defaultLocale;
}

export function getLocaleFromPathname(pathname: string): SupportedLocale | null {
  const segment = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  return isSupportedLocale(segment) ? segment : null;
}

export function stripLocaleFromPathname(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return isSupportedLocale(parts[0]?.toLowerCase()) ? `/${parts.slice(1).join("/")}` || "/" : pathname;
}

export function localizeHref(locale: SupportedLocale, href: string) {
  if (!href.startsWith("/") || href.startsWith("//")) return href;

  const hashIndex = href.indexOf("#");
  const beforeHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const queryIndex = beforeHash.indexOf("?");
  const pathname = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;
  const query = queryIndex >= 0 ? beforeHash.slice(queryIndex) : "";
  const unlocalizedPath = stripLocaleFromPathname(pathname);
  const localizedPath = unlocalizedPath === "/" || unlocalizedPath === "" ? `/${locale}` : `/${locale}${unlocalizedPath}`;

  return `${localizedPath}${query}${hash}`;
}
