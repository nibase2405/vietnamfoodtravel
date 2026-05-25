"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocaleFromPathname, localizeHref, supportedLocales, type SupportedLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils/cn";

type BreadcrumbItem = { label: string; href?: string };

const hrefOverrides: Record<string, string> = {
  "/restaurants": "/food-map",
  "/destinations": "/food-map"
};

const customSegmentLabels: Record<SupportedLocale, Record<string, string>> = {
  "zh-tw": { "city-guides": "城市攻略", rankings: "排行榜", "kol-recommendations": "KOL 推薦", kols: "KOL 推薦" },
  "zh-cn": { "city-guides": "城市攻略", rankings: "排行榜", "kol-recommendations": "KOL 推荐", kols: "KOL 推荐" },
  en: { "city-guides": "City Guides", rankings: "Rankings", "kol-recommendations": "KOL Picks", kols: "KOL Picks" },
  vi: { "city-guides": "Cẩm nang thành phố", rankings: "Xếp hạng", "kol-recommendations": "KOL gợi ý", kols: "KOL gợi ý" },
  ko: { "city-guides": "도시 가이드", rankings: "랭킹", "kol-recommendations": "KOL 추천", kols: "KOL 추천" },
  ja: { "city-guides": "都市ガイド", rankings: "ランキング", "kol-recommendations": "KOLおすすめ", kols: "KOLおすすめ" }
};

function formatSegment(segment: string, locale: SupportedLocale) {
  const decoded = decodeURIComponent(segment);
  const segmentLabels = getDictionary(locale).breadcrumbs.segments as Record<string, string>;
  if (customSegmentLabels[locale]?.[decoded]) return customSegmentLabels[locale][decoded];
  if (segmentLabels[decoded]) return segmentLabels[decoded];
  return decoded
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildItems(pathname: string): BreadcrumbItem[] {
  const locale = getLocaleFromPathname(pathname) ?? "zh-tw";
  const dict = getDictionary(locale);
  const segmentLabels = dict.breadcrumbs.segments as Record<string, string>;
  const rawSegments = pathname.split("/").filter(Boolean);
  const segments = supportedLocales.includes(rawSegments[0]?.toLowerCase() as SupportedLocale) ? rawSegments.slice(1) : rawSegments;
  if (!segments.length) return [];

  const items: BreadcrumbItem[] = [{ label: dict.breadcrumbs.home, href: localizeHref(locale, "/") }];

  segments.forEach((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;
    const isKnownPage = Boolean(segmentLabels[segment]);
    const rawHref = isLast ? undefined : hrefOverrides[path] ?? (isKnownPage ? path : undefined);
    const href = rawHref ? localizeHref(locale, rawHref) : undefined;

    items.push({
      label: formatSegment(segment, locale),
      href
    });
  });

  return items;
}

export function RouteBreadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const items = useMemo(() => buildItems(pathname), [pathname]);

  if (!items.length) return null;

  return (
    <div className={cn("border-b bg-background/95", className)}>
      <div className="mx-auto max-w-7xl px-4 py-3">
        <Breadcrumbs items={items} />
      </div>
    </div>
  );
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const locale = getLocaleFromPathname(usePathname()) ?? "zh-tw";
  const dict = getDictionary(locale);

  return (
    <nav aria-label={dict.breadcrumbs.ariaLabel} className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
          {item.href ? (
            <Link href={item.href} className="inline-flex min-w-0 items-center gap-1 truncate hover:text-foreground">
              {index === 0 ? <Home className="h-3.5 w-3.5 shrink-0" /> : null}
              <span className="truncate">{item.label}</span>
            </Link>
          ) : (
            <span className="truncate font-medium text-foreground" aria-current="page">{item.label}</span>
          )}
          {index < items.length - 1 ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" /> : null}
        </span>
      ))}
    </nav>
  );
}
