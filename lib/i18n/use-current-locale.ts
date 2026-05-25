"use client";

import { usePathname } from "next/navigation";
import { defaultLocale, getLocaleFromPathname, type SupportedLocale } from "@/lib/i18n/config";

export function useCurrentLocale(): SupportedLocale {
  const pathname = usePathname();
  return getLocaleFromPathname(pathname) ?? defaultLocale;
}
