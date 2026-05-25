"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Languages, MapPin, Navigation, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FavoriteButton } from "@/components/map/FavoriteButton";
import { AddToTripListButton } from "@/components/map/AddToTripListButton";
import { localizeHref, type SupportedLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useCurrentLocale } from "@/lib/i18n/use-current-locale";
import type { Restaurant } from "@/types";

const priceLabels: Record<string, string> = {
  low: "$",
  medium: "$$",
  high: "$$$",
  luxury: "$$$$"
};

const photoBadgeBaseClass = "border border-white/90 px-2.5 py-1 font-semibold text-white shadow-[0_2px_8px_rgba(0,0,0,0.35)] ring-1 ring-black/20";
const sponsoredBadgeClass = `${photoBadgeBaseClass} bg-zinc-950`;
const openBadgeClass = `${photoBadgeBaseClass} bg-emerald-700`;
const closedBadgeClass = `${photoBadgeBaseClass} bg-zinc-700`;

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("a,button,input,select,textarea,[role='button']"));
}

function restaurantNameKey(locale: SupportedLocale) {
  if (locale === "zh-tw") return "zh-TW";
  if (locale === "zh-cn") return "zh-CN";
  return locale;
}

const restaurantLabelTranslations: Record<SupportedLocale, Record<string, string>> = {
  "zh-tw": {},
  "zh-cn": {
    越南河粉: "越南河粉", 越南料理: "越南料理", 早餐: "早餐", 順化料理: "顺化料理", 咖啡: "咖啡", 甜點: "甜点", 海鮮: "海鲜", 越南法國麵包: "越南法棍", 繁中菜單: "繁中菜单", 中文菜單: "中文菜单", 日文菜單: "日文菜单", 韓文菜單: "韩文菜单"
  },
  en: {
    越南河粉: "Pho", 越南料理: "Vietnamese", 早餐: "Breakfast", 順化料理: "Hue cuisine", 咖啡: "Cafe", 甜點: "Dessert", 海鮮: "Seafood", 越南法國麵包: "Banh mi", 繁中菜單: "Traditional Chinese menu", 中文菜單: "Chinese menu", 日文菜單: "Japanese menu", 韓文菜單: "Korean menu", "English menu": "English menu", "Tiếng Việt": "Vietnamese"
  },
  vi: {
    越南河粉: "Phở", 越南料理: "Món Việt", 早餐: "Bữa sáng", 順化料理: "Ẩm thực Huế", 咖啡: "Cà phê", 甜點: "Tráng miệng", 海鮮: "Hải sản", 越南法國麵包: "Bánh mì", 繁中菜單: "Thực đơn Hoa phồn thể", 中文菜單: "Thực đơn tiếng Trung", 日文菜單: "Thực đơn tiếng Nhật", 韓文菜單: "Thực đơn tiếng Hàn", "English menu": "Thực đơn tiếng Anh", "Tiếng Việt": "Tiếng Việt"
  },
  ko: {
    越南河粉: "쌀국수", 越南料理: "베트남 음식", 早餐: "아침", 順化料理: "후에 요리", 咖啡: "카페", 甜點: "디저트", 海鮮: "해산물", 越南法國麵包: "반미", 繁中菜單: "번체중문 메뉴", 中文菜單: "중국어 메뉴", 日文菜單: "일본어 메뉴", 韓文菜單: "한국어 메뉴", "English menu": "영어 메뉴", "Tiếng Việt": "베트남어"
  },
  ja: {
    越南河粉: "フォー", 越南料理: "ベトナム料理", 早餐: "朝食", 順化料理: "フエ料理", 咖啡: "カフェ", 甜點: "デザート", 海鮮: "海鮮", 越南法國麵包: "バインミー", 繁中菜單: "繁体字メニュー", 中文菜單: "中国語メニュー", 日文菜單: "日本語メニュー", 韓文菜單: "韓国語メニュー", "English menu": "英語メニュー", "Tiếng Việt": "ベトナム語"
  }
};

function translateRestaurantLabel(locale: SupportedLocale, value: string) {
  return restaurantLabelTranslations[locale][value] ?? value;
}

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const locale = useCurrentLocale();
  const dict = getDictionary(locale);
  const router = useRouter();
  const href = localizeHref(locale, `/restaurants/${restaurant.slug}`);
  const city = restaurant.destinations?.city ?? restaurant.district ?? "Vietnam";
  const price = restaurant.price_range ? priceLabels[restaurant.price_range] : restaurant.average_spend;
  const coverImage = restaurant.cover_image_url ?? "/placeholder.jpg";
  const localizedName =
    restaurant.multilingual_names?.[restaurantNameKey(locale) as keyof typeof restaurant.multilingual_names] ??
    (locale === "zh-cn" ? restaurant.multilingual_names?.["zh-TW"] : undefined);

  function openRestaurant() {
    router.push(href);
  }

  function handleCardClick(event: MouseEvent<HTMLDivElement>) {
    if (isInteractiveTarget(event.target)) return;
    openRestaurant();
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (isInteractiveTarget(event.target)) return;
    event.preventDefault();
    openRestaurant();
  }

  return (
    <Card
      role="link"
      tabIndex={0}
      aria-label={dict.restaurantCard.ariaLabel.replace("{name}", restaurant.name)}
      className="cursor-pointer overflow-hidden transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <div className="relative h-40 overflow-hidden bg-muted">
        <Image
          src={coverImage}
          alt={restaurant.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-300 hover:scale-[1.02]"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/45 to-transparent" />
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
          {restaurant.sponsored ? <Badge className={sponsoredBadgeClass}>{dict.restaurantCard.sponsored}</Badge> : null}
          {restaurant.is_open ? <Badge className={openBadgeClass}>{dict.restaurantCard.open}</Badge> : <Badge className={closedBadgeClass}>{dict.restaurantCard.closed}</Badge>}
        </div>
        <FavoriteButton entityType="restaurant" entityId={restaurant.id} className="absolute right-3 top-3 z-10" />
      </div>
      <div className="grid gap-3 p-4">
        <div>
          <Link href={href} className="font-semibold leading-tight hover:underline">
            {restaurant.name}
          </Link>
          {localizedName ? <div className="mt-1 text-xs text-muted-foreground">{localizedName}</div> : null}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
            {restaurant.rating_avg}
            <span className="text-xs">({restaurant.review_count})</span>
          </span>
          <span>{price}</span>
          {restaurant.distance_km ? <span>{restaurant.distance_km} km</span> : null}
        </div>
        <p className="flex items-start gap-1 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{city} · {restaurant.address}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {restaurant.cuisine_type?.slice(0, 3).map((tag) => <Badge key={tag}>{translateRestaurantLabel(locale, tag)}</Badge>)}
        </div>
        <div className="grid gap-1.5 text-xs text-muted-foreground">
          {restaurant.opening_hours ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {restaurant.opening_hours}
            </span>
          ) : null}
          {restaurant.languages?.length ? (
            <span className="flex items-center gap-1">
              <Languages className="h-3.5 w-3.5" />
              {restaurant.languages.map((language) => translateRestaurantLabel(locale, language)).join(" / ")}
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <AddToTripListButton entityType="restaurant" entityId={restaurant.id} title={restaurant.name} latitude={restaurant.latitude} longitude={restaurant.longitude} />
          <Button asChild variant="outline" size="sm">
            <Link href={href}>
              <Sparkles className="h-4 w-4" />
              {dict.restaurantCard.aiSummary}
            </Link>
          </Button>
          {restaurant.latitude && restaurant.longitude ? (
            <Button asChild variant="ghost" size="sm">
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`} target="_blank" rel="noreferrer">
                <Navigation className="h-4 w-4" />
                {dict.restaurantCard.directions}
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
