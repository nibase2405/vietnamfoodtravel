import { cookies, headers } from "next/headers";
import { cache } from "react";
import { defaultLocale, normalizeLocale, type SupportedLocale } from "@/lib/i18n/config";

export const getCurrentLocale = cache(async function getCurrentLocale(): Promise<SupportedLocale> {
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);
  return normalizeLocale(headerStore.get("x-vietfood-locale") ?? cookieStore.get("vietfood_locale")?.value ?? defaultLocale);
});
