"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bot, LocateFixed, List, Map, MapPinned, PanelLeft, SlidersHorizontal } from "lucide-react";
import { RestaurantCard } from "@/components/cards/RestaurantCard";
import { FilterSidebar } from "@/components/forms/FilterSidebar";
import { MapView } from "@/components/map/MapView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { localizeHref, type SupportedLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils/cn";
import type { MapMarker, Restaurant } from "@/types";

type ViewMode = "list" | "split" | "map";

const modeIcons: { value: ViewMode; Icon: typeof List }[] = [
  { value: "list", Icon: List },
  { value: "split", Icon: PanelLeft },
  { value: "map", Icon: Map }
];

export function FoodMapExplorer({ locale, restaurants, markers }: { locale: SupportedLocale; restaurants: Restaurant[]; markers: MapMarker[] }) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>("split");
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  function openMarker(marker: MapMarker) {
    setSelectedId(marker.id);
    if (marker.href) router.push(marker.href);
  }

  if (mode === "map") {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-muted/20">
        <section className="mx-auto grid max-w-7xl gap-4 p-4">
          <Toolbar locale={locale} mode={mode} setMode={setMode} count={restaurants.length} />
          <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
            <FilterSidebar title={dict.foodMap.filterTitle} type="restaurants" />
            <MapView markers={markers} selectedId={selectedId} onMarkerClick={openMarker} className="min-h-[560px] h-[calc(100vh-15rem)]" />
          </div>
        </section>
      </main>
    );
  }

  if (mode === "list") {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-muted/20">
        <section className="mx-auto grid max-w-6xl gap-4 p-4">
          <Toolbar locale={locale} mode={mode} setMode={setMode} count={restaurants.length} />
          <FilterSidebar title={dict.foodMap.filterTitle} type="restaurants" collapsible />
          <RestaurantResults locale={locale} restaurants={restaurants} className="grid gap-4 md:grid-cols-2" />
        </section>
      </main>
    );
  }

  return (
    <main className="grid min-h-[calc(100vh-4rem)] bg-muted/20 lg:grid-cols-[380px_1fr]">
      <section className="grid content-start gap-4 overflow-y-auto p-4">
        <Toolbar locale={locale} mode={mode} setMode={setMode} count={restaurants.length} />
        <FilterSidebar title={dict.foodMap.filterTitle} type="restaurants" collapsible />
        <RestaurantResults locale={locale} restaurants={restaurants} className="grid gap-4" />
      </section>
      <section className="p-4 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]">
        <MapView markers={markers} selectedId={selectedId} onMarkerClick={openMarker} className="h-[75vh] lg:h-full" />
      </section>
    </main>
  );
}

function Toolbar({ locale, mode, setMode, count }: { locale: SupportedLocale; mode: ViewMode; setMode: (mode: ViewMode) => void; count: number }) {
  const dict = getDictionary(locale);
  const modeLabels = dict.foodMap.modes;

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPinned className="h-4 w-4 text-primary" />
            VietFood Map
          </div>
          <h1 className="mt-2 text-2xl font-semibold">{dict.foodMap.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {dict.foodMap.description}
          </p>
        </div>
        <div className="grid gap-3">
          <div className="inline-flex rounded-lg border bg-muted/50 p-1">
            {modeIcons.map(({ value, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition",
                  mode === value && "bg-white text-foreground shadow-sm"
                )}
                aria-pressed={mode === value}
              >
                <Icon className="h-4 w-4" />
                {modeLabels[value]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button size="sm" variant="outline">
              <LocateFixed className="h-4 w-4" />
              {dict.foodMap.nearby}
            </Button>
            <Button asChild size="sm">
              <Link href={localizeHref(locale, "/ai-food-assistant")}>
                <Bot className="h-4 w-4" />
                {dict.foodMap.askAi}
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          {count} {dict.common.restaurantCount}
        </div>
        <Badge>{modeLabels[mode]}</Badge>
      </div>
    </div>
  );
}

function RestaurantResults({ locale, restaurants, className }: { locale: SupportedLocale; restaurants: Restaurant[]; className: string }) {
  const dict = getDictionary(locale);

  return (
    <div className={className}>
      {restaurants.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}
      {!restaurants.length ? (
        <div className="rounded-lg border border-dashed bg-white p-6 text-sm text-muted-foreground">
          {dict.foodMap.noResults}
        </div>
      ) : null}
    </div>
  );
}
