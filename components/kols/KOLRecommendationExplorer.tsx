"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, MapPin, Star, Utensils } from "lucide-react";
import { MapView } from "@/components/map/MapView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { kolVisitMarkers } from "@/lib/kols";
import { localizeHref, type SupportedLocale } from "@/lib/i18n/config";
import type { KOL, KOLVisit } from "@/types";

const selectClass = "h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function filteredVisits(visits: KOLVisit[] | undefined, visitType: string) {
  if (visitType === "food" || visitType === "attraction") {
    return (visits ?? []).filter((visit) => visit.visit_type === visitType);
  }
  return visits ?? [];
}

export function KOLRecommendationExplorer({ kols, locale, initialSlug }: { kols: KOL[]; locale: SupportedLocale; initialSlug?: string }) {
  const [selectedSlug, setSelectedSlug] = useState(
    initialSlug && kols.some((kol) => kol.slug === initialSlug) ? initialSlug : kols[0]?.slug ?? ""
  );
  const [cityFilter, setCityFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [visitTypeFilter, setVisitTypeFilter] = useState("all");
  const cityOptions = useMemo(() => Array.from(new Set(kols.map((kol) => kol.city).filter((city): city is string => Boolean(city)))).sort(), [kols]);
  const tagOptions = useMemo(() => Array.from(new Set(kols.flatMap((kol) => kol.specialty_tags ?? []))).sort(), [kols]);
  const filteredKOLs = useMemo(() =>
    kols.filter((kol) =>
      (!cityFilter || kol.city === cityFilter) &&
      (!tagFilter || kol.specialty_tags?.includes(tagFilter)) &&
      filteredVisits(kol.visits, visitTypeFilter).length > 0
    ),
  [cityFilter, kols, tagFilter, visitTypeFilter]);
  const selected = filteredKOLs.find((kol) => kol.slug === selectedSlug) ?? filteredKOLs[0];
  const selectedVisits = useMemo(() => filteredVisits(selected?.visits, visitTypeFilter), [selected, visitTypeFilter]);
  const markers = useMemo(() =>
    kolVisitMarkers(selected ? [{ ...selected, visits: selectedVisits }] : filteredKOLs.map((kol) => ({ ...kol, visits: filteredVisits(kol.visits, visitTypeFilter) })))
      .map((marker) => ({
        ...marker,
        href: marker.href ? localizeHref(locale, marker.href) : undefined
      })),
  [filteredKOLs, locale, selected, selectedVisits, visitTypeFilter]);

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[360px_1fr]">
      <aside className="grid content-start gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Star className="h-4 w-4 text-primary" />
            KOL 篩選
          </div>
          <div className="mt-4 grid gap-3">
            <select value={cityFilter} onChange={(event) => setCityFilter(event.target.value)} className={selectClass} aria-label="依城市篩選 KOL">
              <option value="">全部城市</option>
              {cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
            <select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} className={selectClass} aria-label="依主題篩選 KOL">
              <option value="">全部主題</option>
              {tagOptions.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
            </select>
            <select value={visitTypeFilter} onChange={(event) => setVisitTypeFilter(event.target.value)} className={selectClass} aria-label="依推薦類型篩選 KOL">
              <option value="all">美食與景點</option>
              <option value="food">只看美食</option>
              <option value="attraction">只看景點</option>
            </select>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">{filteredKOLs.length} 位 KOL，{markers.length} 個地圖點</div>
        </div>

        {filteredKOLs.map((kol) => (
          <button
            key={kol.slug}
            type="button"
            onClick={() => setSelectedSlug(kol.slug)}
            className={`overflow-hidden rounded-lg border bg-card text-left shadow-sm transition hover:border-primary ${selected?.slug === kol.slug ? "border-primary ring-2 ring-primary/20" : ""}`}
          >
            <div className="relative h-28 bg-muted">
              {kol.cover_image_url ? <img src={kol.cover_image_url} alt={kol.name} className="h-full w-full object-cover" /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <div className="absolute bottom-3 left-3 flex items-center gap-3 text-white">
                {kol.avatar_url ? <img src={kol.avatar_url} alt="" className="h-12 w-12 rounded-full border-2 border-white object-cover" /> : null}
                <div>
                  <div className="font-semibold">{kol.name}</div>
                  <div className="text-xs text-white/80">{kol.handle}</div>
                </div>
              </div>
            </div>
            <div className="grid gap-3 p-4">
              <p className="line-clamp-2 text-sm text-muted-foreground">{kol.bio}</p>
              <div className="flex flex-wrap gap-2">
                {kol.specialty_tags?.slice(0, 3).map((tag) => <Badge key={tag}>{tag}</Badge>)}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{kol.city}</span>
                <span>{new Intl.NumberFormat("en-US").format(kol.follower_count ?? 0)} followers</span>
              </div>
            </div>
          </button>
        ))}
        {!filteredKOLs.length ? (
          <div className="rounded-lg border border-dashed bg-card p-5 text-sm text-muted-foreground">
            目前沒有符合條件的 KOL 推薦，請調整城市、主題或推薦類型。
          </div>
        ) : null}
      </aside>

      <div className="grid gap-5">
        {selected ? (
          <article className="rounded-lg border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Star className="h-4 w-4" />
                  KOL Recommendation
                </div>
                <h2 className="mt-2 text-3xl font-semibold">{selected.name}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{selected.bio}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selected.social_links ?? {}).map(([key, href]) => (
                  <Button key={key} asChild variant="outline" size="sm">
                    <a href={href} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      {key}
                    </a>
                  </Button>
                ))}
                <Button asChild size="sm">
                  <Link href={localizeHref(locale, `/kol-recommendations/${selected.slug}`)}>查看 KOL 頁</Link>
                </Button>
              </div>
            </div>
          </article>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <MapView markers={markers} className="h-[620px]" />
          <div className="grid content-start gap-3">
            <h3 className="text-lg font-semibold">去過的美食與景點</h3>
            {selectedVisits.map((visit) => (
              <article key={visit.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start gap-3">
                  {visit.cover_image_url ? <img src={visit.cover_image_url} alt="" className="h-20 w-20 rounded-md object-cover" /> : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={visit.visit_type === "food" ? "bg-primary text-primary-foreground" : ""}>
                        {visit.visit_type === "food" ? "KOL 美食" : "KOL 景點"}
                      </Badge>
                      {visit.rating ? <span className="text-sm text-muted-foreground">★ {visit.rating}</span> : null}
                    </div>
                    <h4 className="mt-2 font-semibold">{visit.title}</h4>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{visit.description}</p>
                    <div className="mt-2 flex items-start gap-1 text-xs text-muted-foreground">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {visit.address || visit.city}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {visit.restaurant_slug ? (
                        <Button asChild variant="outline" size="sm">
                          <Link href={localizeHref(locale, `/restaurants/${visit.restaurant_slug}`)}>
                            <Utensils className="h-4 w-4" />
                            餐廳頁
                          </Link>
                        </Button>
                      ) : null}
                      {visit.attraction_slug ? (
                        <Button asChild variant="outline" size="sm">
                          <Link href={localizeHref(locale, `/attractions/${visit.attraction_slug}`)}>
                            <MapPin className="h-4 w-4" />
                            景點頁
                          </Link>
                        </Button>
                      ) : null}
                      {visit.content_url ? (
                        <Button asChild variant="ghost" size="sm">
                          <a href={visit.content_url} target="_blank" rel="noreferrer">KOL 內容</a>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
