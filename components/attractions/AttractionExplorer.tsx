"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Compass, MapPinned } from "lucide-react";
import { AttractionCard } from "@/components/cards/AttractionCard";
import { FilterSidebar } from "@/components/forms/FilterSidebar";
import { MapView } from "@/components/map/MapView";
import { Badge } from "@/components/ui/badge";
import { ATTRACTION_STORAGE_KEY, mergeAttractions, normalizeAttractions } from "@/lib/attractions";
import { hasCoordinates } from "@/lib/geo/distance";
import { localizeHref, type SupportedLocale } from "@/lib/i18n/config";
import { useCurrentLocale } from "@/lib/i18n/use-current-locale";
import type { Attraction } from "@/types";

const labels: Record<SupportedLocale, { title: string; count: (count: number) => string; trip: string; empty: string; map: string }> = {
  "zh-tw": {
    title: "景點篩選",
    count: (count) => `${count} 個景點`,
    trip: "可加入行程",
    empty: "目前沒有符合條件的景點。",
    map: "景點地圖"
  },
  "zh-cn": {
    title: "景点筛选",
    count: (count) => `${count} 个景点`,
    trip: "可加入行程",
    empty: "目前没有符合条件的景点。",
    map: "景点地图"
  },
  en: {
    title: "Attraction Filters",
    count: (count) => `${count} attractions`,
    trip: "Can be added to trips",
    empty: "No attractions match these filters.",
    map: "Attraction Map"
  },
  vi: {
    title: "Bộ lọc điểm tham quan",
    count: (count) => `${count} điểm tham quan`,
    trip: "Có thể thêm vào lịch trình",
    empty: "Không có điểm tham quan phù hợp.",
    map: "Bản đồ điểm tham quan"
  },
  ko: {
    title: "관광지 필터",
    count: (count) => `관광지 ${count}곳`,
    trip: "일정에 추가 가능",
    empty: "조건에 맞는 관광지가 없습니다.",
    map: "관광지 지도"
  },
  ja: {
    title: "観光スポット絞り込み",
    count: (count) => `${count} 件の観光スポット`,
    trip: "旅程に追加できます",
    empty: "条件に一致する観光スポットはありません。",
    map: "観光スポット地図"
  }
};

function readLocalAttractions() {
  try {
    return normalizeAttractions(JSON.parse(window.localStorage.getItem(ATTRACTION_STORAGE_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

function includesText(value: string | null | undefined, keyword: string) {
  return value?.toLowerCase().includes(keyword.toLowerCase()) ?? false;
}

function matchesFilters(attraction: Attraction, city: string, category: string) {
  const categories = attraction.category ?? [];
  return (
    (!city || includesText(attraction.destinations?.city, city) || includesText(attraction.destination_id, city)) &&
    (!category || categories.some((item) => includesText(item, category)))
  );
}

export function AttractionExplorer({ initialAttractions }: { initialAttractions: Attraction[] }) {
  const locale = useCurrentLocale();
  const text = labels[locale];
  const searchParams = useSearchParams();
  const [localAttractions, setLocalAttractions] = useState<Attraction[]>([]);
  const city = searchParams.get("city") ?? "";
  const category = searchParams.get("category") ?? "";

  useEffect(() => {
    setLocalAttractions(readLocalAttractions());
  }, []);

  const attractions = useMemo(() => {
    return mergeAttractions(initialAttractions, localAttractions)
      .filter((attraction) => attraction.status === "published")
      .filter((attraction) => matchesFilters(attraction, city, category));
  }, [category, city, initialAttractions, localAttractions]);

  const markers = attractions
    .filter((item): item is Attraction & { latitude: number; longitude: number } => hasCoordinates(item))
    .map((item) => ({
      id: item.id,
      title: item.name,
      subtitle: item.address ?? "",
      latitude: item.latitude,
      longitude: item.longitude,
      href: localizeHref(locale, `/attractions/${item.slug}`),
      type: "attraction" as const
    }));

  return (
    <section id="attraction-list" className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[390px_1fr]">
      <aside className="grid content-start gap-4">
        <FilterSidebar title={text.title} type="attractions" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Compass className="h-4 w-4 text-primary" />
            {text.count(attractions.length)}
          </div>
          <Badge className="bg-primary text-primary-foreground">{text.trip}</Badge>
        </div>
        <div className="grid gap-4">
          {attractions.length ? (
            attractions.map((item) => <AttractionCard key={item.slug} attraction={item} />)
          ) : (
            <div className="rounded-lg border border-dashed bg-card p-6 text-sm text-muted-foreground">{text.empty}</div>
          )}
        </div>
      </aside>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <MapPinned className="h-4 w-4 text-primary" />
          {text.map}
        </div>
        <MapView markers={markers} className="h-[72vh] min-h-[520px]" />
      </div>
    </section>
  );
}
