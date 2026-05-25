"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight, CalendarCheck, Eye, MapPin, MapPinned, Star, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { applyRankingSettings, normalizeRankingSettings, type RankingSetting } from "@/lib/ranking-settings";
import { localizeHref, type SupportedLocale } from "@/lib/i18n/config";
import type { RankingGroup } from "@/lib/rankings";
import type { Restaurant } from "@/types";

const priceLabels: Record<string, string> = {
  low: "$",
  medium: "$$",
  high: "$$$",
  luxury: "$$$$"
};

const numberLocales: Record<SupportedLocale, string> = {
  "zh-tw": "zh-TW",
  "zh-cn": "zh-CN",
  en: "en-US",
  vi: "vi-VN",
  ko: "ko-KR",
  ja: "ja-JP"
};

const accentClasses = [
  "border-t-primary",
  "border-t-accent",
  "border-t-[hsl(var(--warning))]",
  "border-t-zinc-800",
  "border-t-emerald-700",
  "border-t-sky-700"
];

function foodMapHref(group: RankingGroup, city?: string, category?: string) {
  const params = new URLSearchParams();
  params.set("sort", (group.ranking_key ?? group.id).replace(/-/g, "_"));
  if (city) params.set("city", city);
  if (category || group.category) params.set("cuisine", category || group.category || "");
  return `/food-map?${params.toString()}`;
}

function numberText(value: number | null | undefined, locale: SupportedLocale) {
  return new Intl.NumberFormat(numberLocales[locale]).format(Number(value ?? 0));
}

function rankClass(index: number) {
  if (index === 0) return "border-[hsl(var(--warning))] bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]";
  if (index === 1) return "border-zinc-800 bg-zinc-800 text-white";
  if (index === 2) return "border-accent bg-accent text-accent-foreground";
  return "border-border bg-background text-foreground";
}

function chunkGroups(groups: RankingGroup[], size = 3) {
  const chunks: RankingGroup[][] = [];
  for (let index = 0; index < groups.length; index += size) {
    chunks.push(groups.slice(index, index + size));
  }
  return chunks;
}

export function RankingBoard({
  groups,
  locale,
  city,
  category,
  initialSettings = []
}: {
  groups: RankingGroup[];
  locale: SupportedLocale;
  city?: string;
  category?: string;
  initialSettings?: RankingSetting[];
}) {
  const settings = useMemo(() => normalizeRankingSettings(initialSettings), [initialSettings]);
  const visibleGroups = useMemo(() => applyRankingSettings(groups, settings, { locale, city, category }), [groups, settings, locale, city, category]);
  const groupedRankings = useMemo(() => chunkGroups(visibleGroups, 3), [visibleGroups]);
  const uniqueRestaurantCount = useMemo(() => new Set(visibleGroups.flatMap((group) => group.restaurants.map((restaurant) => restaurant.id))).size, [visibleGroups]);
  const totalSlots = visibleGroups.reduce((sum, group) => sum + group.restaurants.length, 0);

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12">
      <nav className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <Trophy className="h-4 w-4 text-primary" />
              排行榜類型
            </div>
            <p className="mt-1 text-sm text-muted-foreground">快速跳到指定榜單，或進入美食地圖查看完整清單。</p>
          </div>
          <div className="grid grid-cols-3 overflow-hidden rounded-md border text-center text-xs">
            <SummaryStat label="榜單" value={numberText(visibleGroups.length, locale)} />
            <SummaryStat label="餐廳" value={numberText(uniqueRestaurantCount, locale)} />
            <SummaryStat label="排名席次" value={numberText(totalSlots, locale)} />
          </div>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {visibleGroups.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="shrink-0 rounded-full border bg-background px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              {group.title}
            </a>
          ))}
        </div>
      </nav>

      {groupedRankings.map((row, rowIndex) => (
        <section key={row.map((group) => group.id).join("-")} aria-label={`排行榜區塊 ${rowIndex + 1}`} className="grid gap-4 lg:grid-cols-3">
          {row.map((group, panelIndex) => (
            <RankingPanel key={group.id} group={group} locale={locale} city={city} category={category} index={rowIndex * 3 + panelIndex} />
          ))}
        </section>
      ))}
    </section>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-20 border-r px-3 py-2 last:border-r-0">
      <div className="font-semibold text-foreground">{value}</div>
      <div className="mt-0.5 text-muted-foreground">{label}</div>
    </div>
  );
}

function RankingPanel({ group, locale, city, category, index }: { group: RankingGroup; locale: SupportedLocale; city?: string; category?: string; index: number }) {
  const topRestaurant = group.restaurants[0];
  const remainingRestaurants = group.restaurants.slice(1, 5);
  const accentClass = accentClasses[index % accentClasses.length];

  return (
    <article id={group.id} className={`scroll-mt-24 overflow-hidden rounded-lg border border-t-4 bg-card shadow-sm ${accentClass}`}>
      <div className="border-b p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className="border border-border bg-background text-foreground">榜單 {String(index + 1).padStart(2, "0")}</Badge>
              <Badge className="bg-secondary text-secondary-foreground">Top {Math.min(group.restaurants.length, 5)}</Badge>
              {group.category ? <Badge className="bg-primary text-primary-foreground">{group.category}</Badge> : null}
            </div>
            <h2 className="line-clamp-2 text-lg font-semibold leading-6">
              {group.title}
            </h2>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{group.description}</p>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0 px-2">
            <Link href={localizeHref(locale, foodMapHref(group, city, category))} aria-label={`${group.title} 地圖查看`}>
              <MapPinned className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {group.restaurants.length ? (
        <>
          {topRestaurant ? <FeaturedRankingRow restaurant={topRestaurant} group={group} locale={locale} /> : null}
          <ol className="divide-y">
            {remainingRestaurants.map((restaurant, rowIndex) => (
              <RankingRow key={`${group.id}-${restaurant.id}`} restaurant={restaurant} index={rowIndex + 1} locale={locale} />
            ))}
          </ol>
        </>
      ) : (
        <div className="p-5 text-sm text-muted-foreground">
          目前沒有符合條件的餐廳，請先在後台新增或調整排行榜規則。
        </div>
      )}
    </article>
  );
}

function FeaturedRankingRow({ restaurant, group, locale }: { restaurant: Restaurant; group: RankingGroup; locale: SupportedLocale }) {
  const href = localizeHref(locale, `/restaurants/${restaurant.slug}`);
  const imageSrc = restaurant.cover_image_url ?? "/placeholder.jpg";
  const cuisine = restaurant.cuisine_type?.slice(0, 2) ?? [];
  const price = restaurant.price_range ? priceLabels[restaurant.price_range] : restaurant.average_spend;

  return (
    <div className="border-b bg-secondary/35">
      <div className="relative h-36 bg-muted">
        <Image src={imageSrc} alt={restaurant.name} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute left-3 top-3 grid h-11 w-11 place-items-center rounded-md border border-white/25 bg-[hsl(var(--warning))] text-lg font-semibold text-[hsl(var(--warning-foreground))] shadow-sm">
          1
        </div>
        <Link href={href} className="absolute inset-x-3 bottom-3 text-white">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="line-clamp-1 text-base font-semibold">{restaurant.name}</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-white/85">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="line-clamp-1">{restaurant.destinations?.city ?? restaurant.district ?? "Vietnam"}</span>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 shrink-0" />
          </div>
        </Link>
      </div>
      <div className="grid gap-3 p-3">
        <div className="grid grid-cols-[56px_1fr] gap-3">
          <RestaurantThumbnail restaurant={restaurant} href={href} className="h-14 w-14" />
          <div className="min-w-0">
            <Link href={href} className="line-clamp-1 font-semibold hover:underline">
              {restaurant.name}
            </Link>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge className="bg-primary text-primary-foreground">{group.title}</Badge>
              {cuisine.map((tag) => <Badge key={tag} className="border border-border bg-card text-foreground">{tag}</Badge>)}
              {price ? <Badge className="border border-border bg-card text-foreground">{price}</Badge> : null}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <Metric icon={Star} label="評分" value={restaurant.rating_avg ? String(restaurant.rating_avg) : "-"} />
          <Metric icon={Eye} label="瀏覽" value={numberText(restaurant.view_count, locale)} />
          <Metric icon={CalendarCheck} label="預訂" value={numberText(restaurant.booking_count, locale)} />
        </div>
      </div>
    </div>
  );
}

function RankingRow({ restaurant, index, locale }: { restaurant: Restaurant; index: number; locale: SupportedLocale }) {
  const href = localizeHref(locale, `/restaurants/${restaurant.slug}`);
  const cuisine = restaurant.cuisine_type?.slice(0, 2) ?? [];
  const price = restaurant.price_range ? priceLabels[restaurant.price_range] : restaurant.average_spend;

  return (
    <li className="grid grid-cols-[42px_56px_1fr_auto] gap-3 p-3 transition hover:bg-muted/45">
      <div className={`grid h-9 w-9 place-items-center rounded-md border text-sm font-semibold ${rankClass(index)}`}>
        {index + 1}
      </div>

      <RestaurantThumbnail restaurant={restaurant} href={href} />

      <div className="min-w-0">
        <Link href={href} className="line-clamp-1 font-semibold hover:underline">
          {restaurant.name}
        </Link>
        <div className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="line-clamp-1">{restaurant.destinations?.city ?? restaurant.district ?? "Vietnam"}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {cuisine.map((tag) => <Badge key={tag} className="bg-muted text-foreground">{tag}</Badge>)}
          {price ? <Badge className="border border-border bg-card text-foreground">{price}</Badge> : null}
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <InlineMetric icon={Star} value={restaurant.rating_avg ? String(restaurant.rating_avg) : "-"} />
          <InlineMetric icon={Eye} value={numberText(restaurant.view_count, locale)} />
          <InlineMetric icon={CalendarCheck} value={numberText(restaurant.booking_count, locale)} />
        </div>
      </div>

      <Button asChild variant="ghost" size="sm" className="self-center px-2">
        <Link href={href} aria-label={`查看 ${restaurant.name}`}>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Button>
    </li>
  );
}

function RestaurantThumbnail({ restaurant, href, className = "h-14 w-14" }: { restaurant: Restaurant; href: string; className?: string }) {
  return (
    <Link href={href} className={`relative block shrink-0 overflow-hidden rounded-md border bg-muted ${className}`} aria-label={`查看 ${restaurant.name}`}>
      <Image src={restaurant.cover_image_url ?? "/placeholder.jpg"} alt={`${restaurant.name} 縮圖`} fill sizes="56px" className="object-cover" />
    </Link>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card px-2.5 py-2">
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-0.5 font-semibold">{value}</div>
    </div>
  );
}

function InlineMetric({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="h-3.5 w-3.5" />
      {value}
    </span>
  );
}
