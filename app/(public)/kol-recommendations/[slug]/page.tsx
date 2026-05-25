import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft, CalendarDays, ExternalLink, Landmark, MapPin, Star, Users, Utensils } from "lucide-react";
import { DeferredMapView } from "@/components/map/DeferredMapView";
import { SocialShare } from "@/components/share/SocialShare";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublicKOLBySlugData, getPublicKOLsData } from "@/lib/data/queries";
import { getCurrentLocale } from "@/lib/i18n/server";
import { localizeHref } from "@/lib/i18n/config";
import { kolVisitMarkers } from "@/lib/kols";
import { pageMetadata } from "@/lib/seo/metadata";
import type { KOLVisit } from "@/types";

const getKOL = cache(getPublicKOLBySlugData);

export const revalidate = 300;

export async function generateStaticParams() {
  const kols = await getPublicKOLsData();
  return kols.map((kol) => ({ slug: kol.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kol = await getKOL(slug);

  return pageMetadata({
    title: kol ? `${kol.name} KOL 推薦地圖` : "KOL 推薦地圖",
    description: kol?.bio ?? "查看 KOL 推薦的越南美食、餐廳、咖啡廳與景點地圖。",
    path: `/kol-recommendations/${slug}`
  });
}

export default async function KOLRecommendationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [kol, locale] = await Promise.all([getKOL(slug), getCurrentLocale()]);
  if (!kol) notFound();

  const visits = kol.visits ?? [];
  const foodVisits = visits.filter((visit) => visit.visit_type === "food");
  const attractionVisits = visits.filter((visit) => visit.visit_type === "attraction");
  const markers = kolVisitMarkers([kol]).map((marker) => ({
    ...marker,
    href: marker.href ? localizeHref(locale, marker.href) : undefined
  }));
  const coverImage = kol.cover_image_url || visits.find((visit) => visit.cover_image_url)?.cover_image_url || "/placeholder.jpg";

  return (
    <main className="bg-muted/20">
      <section className="relative border-b bg-card">
        <div className="absolute inset-0">
          <img src={coverImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
        </div>
        <div className="relative mx-auto grid min-h-[420px] max-w-7xl content-end gap-6 px-4 py-10 text-white">
          <Button asChild variant="outline" className="w-fit border-white/50 bg-white/10 text-white hover:bg-white hover:text-zinc-950">
            <Link href={localizeHref(locale, "/kol-recommendations")}>
              <ArrowLeft className="h-4 w-4" />
              返回 KOL 專區
            </Link>
          </Button>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex max-w-4xl flex-wrap items-end gap-5">
              {kol.avatar_url ? <img src={kol.avatar_url} alt={kol.name} className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg" /> : null}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-white text-zinc-950">KOL Map</Badge>
                  {kol.is_featured ? <Badge className="bg-primary text-primary-foreground">精選 KOL</Badge> : null}
                </div>
                <h1 className="mt-3 text-4xl font-semibold md:text-5xl">{kol.name}</h1>
                <p className="mt-2 text-sm text-white/80">{kol.handle}</p>
                <p className="mt-4 max-w-3xl text-base leading-8 text-white/90">{kol.bio}</p>
              </div>
            </div>
            <SocialShare title={`${kol.name} KOL 推薦地圖`} text={kol.bio ?? "查看 KOL 推薦的美食與景點地圖。"} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8">
        <div className="grid gap-3 md:grid-cols-4">
          <Metric icon={MapPin} label="主要城市" value={kol.city || "越南"} />
          <Metric icon={Utensils} label="美食推薦" value={`${foodVisits.length} 個地點`} />
          <Metric icon={Landmark} label="景點推薦" value={`${attractionVisits.length} 個地點`} />
          <Metric icon={Users} label="追蹤數" value={new Intl.NumberFormat("en-US").format(kol.follower_count ?? 0)} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="grid gap-6">
            <div className="rounded-lg border bg-card p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">KOL 美食與景點地圖</h2>
                  <p className="mt-1 text-sm text-muted-foreground">餐廳、咖啡廳、夜市與景點會依 KOL 去過的地方呈現在地圖上。</p>
                </div>
                <Badge className="border border-border bg-card text-foreground">{markers.length} 個 marker</Badge>
              </div>
              <DeferredMapView markers={markers} className="h-[560px]" />
            </div>

            <VisitSection title="KOL 美食" visits={foodVisits} locale={locale} />
            <VisitSection title="KOL 景點" visits={attractionVisits} locale={locale} />
          </section>

          <aside className="grid content-start gap-4 lg:sticky lg:top-20">
            <div className="rounded-lg border bg-card p-5">
              <h2 className="text-lg font-semibold">KOL 資料</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {kol.specialty_tags?.map((tag) => <Badge key={tag}>{tag}</Badge>)}
              </div>
              <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                <div>語言：{kol.languages?.length ? kol.languages.join(" / ") : "未設定"}</div>
                <div>城市：{kol.city || "未設定"}</div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-5">
              <h2 className="text-lg font-semibold">社群連結</h2>
              <div className="mt-4 grid gap-2">
                {Object.entries(kol.social_links ?? {}).length ? Object.entries(kol.social_links ?? {}).map(([key, href]) => (
                  <Button key={key} asChild variant="outline" className="justify-start">
                    <a href={href} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      {key}
                    </a>
                  </Button>
                )) : <p className="text-sm text-muted-foreground">尚未設定社群連結。</p>}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
    </div>
  );
}

function VisitSection({ title, visits, locale }: { title: string; visits: KOLVisit[]; locale: Awaited<ReturnType<typeof getCurrentLocale>> }) {
  if (!visits.length) return null;

  return (
    <section className="grid gap-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {visits.map((visit) => {
          const href = visit.entity_type === "restaurant" && visit.restaurant_slug
            ? localizeHref(locale, `/restaurants/${visit.restaurant_slug}`)
            : visit.entity_type === "attraction" && visit.attraction_slug
              ? localizeHref(locale, `/attractions/${visit.attraction_slug}`)
              : "";

          return (
            <article key={visit.id} className="rounded-lg border bg-card p-4">
              <div className="flex gap-4">
                {visit.cover_image_url ? <img src={visit.cover_image_url} alt="" className="h-24 w-24 rounded-md object-cover" /> : null}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={visit.visit_type === "food" ? "bg-primary text-primary-foreground" : ""}>
                      {visit.visit_type === "food" ? "美食" : "景點"}
                    </Badge>
                    {visit.rating ? <Badge className="border border-border bg-card text-foreground"><Star className="h-3.5 w-3.5" /> {visit.rating}</Badge> : null}
                    {visit.visited_at ? <Badge className="border border-border bg-card text-foreground"><CalendarDays className="h-3.5 w-3.5" /> {visit.visited_at}</Badge> : null}
                  </div>
                  <h3 className="mt-3 font-semibold">{visit.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{visit.description}</p>
                  <div className="mt-2 flex items-start gap-1 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {visit.address || visit.city || "未設定地址"}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {href ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={href}>{visit.entity_type === "restaurant" ? "餐廳頁" : "景點頁"}</Link>
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
          );
        })}
      </div>
    </section>
  );
}
