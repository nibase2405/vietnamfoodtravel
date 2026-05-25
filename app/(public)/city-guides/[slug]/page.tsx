import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, MapPinned, Route, Search, Utensils } from "lucide-react";
import { AttractionCard } from "@/components/cards/AttractionCard";
import { RestaurantCard } from "@/components/cards/RestaurantCard";
import { DeferredMapView } from "@/components/map/DeferredMapView";
import { SocialShare } from "@/components/share/SocialShare";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCityGuides } from "@/lib/city-guides";
import { getPublicCityGuidesData } from "@/lib/data/queries";
import { localizeHref } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return getCityGuides().map((guide) => ({ slug: guide.slug }));
}

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getCurrentLocale();
  const guide = (await getPublicCityGuidesData(locale)).find((item) => item.slug === slug) ?? null;
  return pageMetadata({
    title: guide?.seoTitle || (guide ? `${guide.title || guide.city} Food Guide` : "City Food Guide"),
    description: guide?.summary ?? "Vietnam city food guide with restaurants, attractions, rankings, and AI itinerary planning.",
    path: `/city-guides/${slug}`,
    image: `/city-guides/${slug}/og`
  });
}

export default async function CityGuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getCurrentLocale();
  const { slug } = await params;
  const guide = (await getPublicCityGuidesData(locale)).find((item) => item.slug === slug) ?? null;
  if (!guide) notFound();

  const markers = [
    ...guide.restaurants
      .filter((item) => typeof item.latitude === "number" && typeof item.longitude === "number")
      .map((item) => ({
        id: item.id,
        title: item.name,
        subtitle: item.address ?? guide.city,
        latitude: item.latitude!,
        longitude: item.longitude!,
        href: localizeHref(locale, `/restaurants/${item.slug}`),
        type: "restaurant" as const
      })),
    ...guide.attractions
      .filter((item) => typeof item.latitude === "number" && typeof item.longitude === "number")
      .map((item) => ({
        id: item.id,
        title: item.name,
        subtitle: item.address ?? guide.city,
        latitude: item.latitude!,
        longitude: item.longitude!,
        href: localizeHref(locale, `/attractions/${item.slug}`),
        type: "attraction" as const
      }))
  ];

  return (
    <main>
      <section
        className="min-h-[420px] bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(13,33,29,.86), rgba(13,33,29,.25)), url(${guide.cover_image_url})` }}
      >
        <div className="mx-auto flex min-h-[420px] max-w-7xl items-end px-4 py-10 text-white">
          <div className="max-w-3xl">
            <Badge className="bg-white text-slate-950">{guide.region}</Badge>
            <h1 className="mt-4 text-5xl font-semibold">{guide.title || `${guide.city} Food Guide`}</h1>
            <p className="mt-4 text-lg leading-8 text-white/85">{guide.summary}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href={localizeHref(locale, `/ai-trip-planner?destination=${encodeURIComponent(guide.city)}`)}>
                  <Route className="h-4 w-4" />
                  AI itinerary
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={localizeHref(locale, `/food-map?city=${encodeURIComponent(guide.city)}`)}>
                  <MapPinned className="h-4 w-4" />
                  Food map
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <div className="grid gap-3 md:grid-cols-4">
            <Stat icon={Utensils} label="Restaurants" value={guide.restaurants.length} />
            <Stat icon={MapPinned} label="Attractions" value={guide.attractions.length} />
            <Stat icon={Search} label="SEO keywords" value={guide.seoKeywords.length} />
            <Stat icon={CalendarDays} label="Plan steps" value={guide.suggestedPlan.length} />
          </div>

          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-2xl font-semibold">{guide.title || guide.city}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <GuideBlock title="熱門區域" items={guide.districts} />
              <GuideBlock title="必吃主題" items={guide.foodThemes} />
              <GuideBlock title="一日路線" items={guide.suggestedPlan} />
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">Recommended restaurants</h2>
              <Button asChild variant="outline" size="sm">
                <Link href={localizeHref(locale, `/rankings?city=${encodeURIComponent(guide.city)}`)}>
                  Rankings
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            {guide.restaurants.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{guide.restaurants.slice(0, 6).map((item) => <RestaurantCard key={item.id} restaurant={item} />)}</div>
            ) : (
              <Empty message="This city is ready for expansion. Add restaurants in Admin to populate the guide." />
            )}
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">Nearby attractions</h2>
            {guide.attractions.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{guide.attractions.slice(0, 6).map((item) => <AttractionCard key={item.id} attraction={item} />)}</div>
            ) : (
              <Empty message="Add attractions in Admin to connect nearby food and distance." />
            )}
          </section>
        </div>

        <aside className="grid content-start gap-4 lg:sticky lg:top-24">
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-lg font-semibold">Share this guide</h2>
            <div className="mt-3">
            <SocialShare title={guide.title || `${guide.city} Food Guide`} text={guide.summary} />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-lg font-semibold">Map</h2>
            <DeferredMapView markers={markers} className="mt-3 h-[520px]" />
          </div>
        </aside>
      </section>
    </main>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Utensils; label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function GuideBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg bg-secondary/70 p-4">
      <div className="font-semibold">{title}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => <Badge key={item}>{item}</Badge>)}
      </div>
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return <div className="rounded-lg border border-dashed bg-card p-6 text-sm text-muted-foreground">{message}</div>;
}
