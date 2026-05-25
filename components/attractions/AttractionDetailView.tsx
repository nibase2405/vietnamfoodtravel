"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock3, MapPin, Navigation, Route, Star, Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AddToTripListButton } from "@/components/map/AddToTripListButton";
import { MapView } from "@/components/map/MapView";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ATTRACTION_STORAGE_KEY, normalizeAttractions } from "@/lib/attractions";
import { distanceKm, hasCoordinates } from "@/lib/geo/distance";
import type { Attraction, Restaurant } from "@/types";

type NearbyRestaurant = {
  restaurant: Restaurant;
  distance: number;
};

function formatDistance(distance: number) {
  return distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`;
}

function googleMapsSearchHref(attraction: Attraction) {
  if (hasCoordinates(attraction)) {
    return `https://www.google.com/maps/search/?api=1&query=${attraction.latitude},${attraction.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${attraction.name} ${attraction.address ?? ""}`)}`;
}

function googleDirectionsHref(attraction: Attraction, restaurant: Restaurant) {
  if (hasCoordinates(attraction) && hasCoordinates(restaurant)) {
    return `https://www.google.com/maps/dir/?api=1&origin=${attraction.latitude},${attraction.longitude}&destination=${restaurant.latitude},${restaurant.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name} ${restaurant.address ?? ""}`)}`;
}

function restaurantPrice(restaurant: Restaurant) {
  if (restaurant.average_spend) return restaurant.average_spend;
  if (restaurant.price_min && restaurant.price_max) {
    return `${restaurant.price_min.toLocaleString("en-US")}-${restaurant.price_max.toLocaleString("en-US")} VND`;
  }
  return "價格待補";
}

function readLocalAttraction(slug: string) {
  try {
    return normalizeAttractions(JSON.parse(window.localStorage.getItem(ATTRACTION_STORAGE_KEY) ?? "[]")).find((item) => item.slug === slug) ?? null;
  } catch {
    return null;
  }
}

export function AttractionDetailView({ attraction, restaurants }: { attraction: Attraction; restaurants: Restaurant[] }) {
  const nearbyRestaurants = useMemo<NearbyRestaurant[]>(() => {
    if (!hasCoordinates(attraction)) return [];

    return restaurants
      .map((restaurant) => ({ restaurant, distance: distanceKm(attraction, restaurant) }))
      .filter((item): item is NearbyRestaurant => typeof item.distance === "number")
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6);
  }, [attraction, restaurants]);

  const markers = [
    ...(hasCoordinates(attraction)
      ? [{
        id: attraction.id,
        title: attraction.name,
        subtitle: attraction.address ?? "",
        latitude: attraction.latitude,
        longitude: attraction.longitude,
        href: `/attractions/${attraction.slug}`,
        type: "attraction" as const
      }]
      : []),
    ...nearbyRestaurants
      .filter((item): item is NearbyRestaurant & { restaurant: Restaurant & { latitude: number; longitude: number } } => hasCoordinates(item.restaurant))
      .map(({ restaurant }) => ({
        id: restaurant.id,
        title: restaurant.name,
        subtitle: restaurant.address ?? "",
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        href: `/restaurants/${restaurant.slug}`,
        type: "restaurant" as const
      }))
  ];

  const categories = attraction.category ?? [];
  const coverImage = attraction.cover_image_url ?? "/placeholder.jpg";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="min-h-[340px] overflow-hidden rounded-lg bg-muted">
          <img src={coverImage} alt={attraction.name} loading="eager" decoding="async" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col justify-center">
          <Badge className="w-fit bg-primary text-primary-foreground">景點介紹</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal md:text-5xl">{attraction.name}</h1>
          <p className="mt-4 flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" />
            {attraction.address ?? "地址待補"}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((category) => <Badge key={category}>{category}</Badge>)}
            {attraction.destinations?.city ? <Badge>{attraction.destinations.city}</Badge> : null}
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <InfoStat icon={Star} label="評分" value={attraction.rating_avg ? attraction.rating_avg.toFixed(1) : "待補"} />
            <InfoStat icon={Utensils} label="附近美食" value={`${nearbyRestaurants.length} 間`} />
            <InfoStat icon={Route} label="路線" value="可開啟導航" />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <AddToTripListButton entityType="attraction" entityId={attraction.id} title={attraction.name} latitude={attraction.latitude} longitude={attraction.longitude} />
            <Button asChild variant="outline">
              <a href={googleMapsSearchHref(attraction)}>
                <Navigation className="h-4 w-4" />
                Google Maps
              </a>
            </Button>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_410px]">
        <section className="grid gap-6">
          <Card className="p-5">
            <h2 className="text-xl font-semibold">景點重點</h2>
            <div className="mt-4 grid gap-3 text-sm leading-7 text-muted-foreground md:grid-cols-2">
              <p>適合安排在城市散步、拍照、購物或夜間小吃路線中，並可搭配附近餐廳組成半日美食行程。</p>
              <p>建議優先挑選 1 公里內評價穩定的餐廳，再依營業時間決定先逛景點或先用餐。</p>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">附近美食</h2>
                <p className="mt-1 text-sm text-muted-foreground">依景點座標自動排序，顯示餐廳距離、類型與價格。</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/food-map">查看美食地圖</Link>
              </Button>
            </div>
            <div className="mt-4 grid gap-3">
              {nearbyRestaurants.length ? (
                nearbyRestaurants.map(({ restaurant, distance }) => (
                  <div key={restaurant.id} className="grid gap-3 rounded-lg border bg-background p-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/restaurants/${restaurant.slug}`} className="font-semibold hover:underline">
                          {restaurant.name}
                        </Link>
                        <Badge className="bg-primary text-primary-foreground">{formatDistance(distance)}</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-[hsl(var(--warning))]" />
                          {restaurant.rating_avg ?? "待補"}
                        </span>
                        <span>{restaurant.cuisine_type?.slice(0, 2).join(" / ") ?? "料理分類待補"}</span>
                        <span>{restaurantPrice(restaurant)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/restaurants/${restaurant.slug}`}>餐廳頁</Link>
                      </Button>
                      <Button asChild size="sm">
                        <a href={googleDirectionsHref(attraction, restaurant)}>
                          <Navigation className="h-4 w-4" />
                          導航
                        </a>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed bg-background p-5 text-sm text-muted-foreground">此景點還沒有可計算距離的附近餐廳。</div>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-xl font-semibold">旅客評論</h2>
            <div className="mt-4">
              <ReviewForm entityType="attraction" entityId={attraction.id} />
            </div>
          </Card>
        </section>

        <aside className="grid content-start gap-4">
          <Card className="p-4">
            <h2 className="font-semibold">位置與周邊餐廳</h2>
            <div className="mt-3">
              <MapView markers={markers} className="h-[460px]" />
            </div>
            <Button asChild className="mt-3 w-full" variant="outline">
              <a href={googleMapsSearchHref(attraction)}>
                <Navigation className="h-4 w-4" />
                在 Google Maps 開啟
              </a>
            </Button>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-secondary text-primary">
                <Clock3 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-semibold">建議安排</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">可先收藏景點，再從附近美食挑 1-2 間加入同一天行程，形成順路的美食散步路線。</p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </main>
  );
}

function InfoStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <div className="mt-2 font-semibold">{value}</div>
    </div>
  );
}

export function LocalAttractionDetail({ slug, restaurants }: { slug: string; restaurants: Restaurant[] }) {
  const [attraction, setAttraction] = useState<Attraction | null | undefined>(undefined);

  useEffect(() => {
    setAttraction(readLocalAttraction(slug));
  }, [slug]);

  if (attraction === undefined) {
    return <main className="mx-auto max-w-7xl px-4 py-12 text-sm text-muted-foreground">正在讀取景點資料...</main>;
  }

  if (!attraction) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12">
        <Card className="p-6">
          <h1 className="text-2xl font-semibold">找不到景點</h1>
          <p className="mt-2 text-sm text-muted-foreground">此景點可能尚未上架，或本機預覽資料已被清除。</p>
          <Button asChild className="mt-5">
            <Link href="/attractions">
              回到景點列表
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </main>
    );
  }

  return <AttractionDetailView attraction={attraction} restaurants={restaurants} />;
}
