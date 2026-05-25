import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bot, Camera, Crown, Languages, MapPinned, Megaphone, Route, Search, Store, Trophy, Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/forms/SearchBar";
import { DestinationCard } from "@/components/cards/DestinationCard";
import { TourCard } from "@/components/cards/TourCard";
import { RestaurantCard } from "@/components/cards/RestaurantCard";
import { BlogCard } from "@/components/cards/BlogCard";
import { DeferredMapView } from "@/components/map/DeferredMapView";
import { JsonLd, pageMetadata } from "@/lib/seo/metadata";
import { localizeHref, type SupportedLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentLocale } from "@/lib/i18n/server";
import {
  getPublicBlogPostsData,
  getPublicDestinationsData,
  getPublicRestaurantsData,
  getPublicToursData
} from "@/lib/data/queries";

export async function generateMetadata() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return pageMetadata({
    title: dict.home.title,
    description: dict.home.description,
    path: "/"
  });
}

export default async function HomePage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  const [destinations, tours, restaurants, blogPosts] = await Promise.all([
    getPublicDestinationsData(),
    getPublicToursData(),
    getPublicRestaurantsData(),
    getPublicBlogPostsData()
  ]);
  const featuredRestaurants = restaurants.filter((restaurant) => restaurant.is_featured).slice(0, 3);
  const leaderboard = [...restaurants].sort((a, b) => Number(b.rating_avg ?? 0) - Number(a.rating_avg ?? 0)).slice(0, 5);
  const markers = featuredRestaurants
    .filter((item) => item.latitude && item.longitude)
    .map((item) => ({
      id: item.id,
      title: item.name,
      subtitle: `${item.destinations?.city ?? "Vietnam"} · ${item.average_spend ?? ""}`,
      latitude: item.latitude!,
      longitude: item.longitude!,
      href: localizeHref(locale, `/restaurants/${item.slug}`),
      type: "restaurant" as const
    }));

  return (
    <main>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: "VietFood Map", areaServed: "Vietnam", inLanguage: ["zh-TW", "zh-CN", "vi", "en", "ko", "ja"] }} />
      <section className="relative overflow-hidden bg-primary">
        <Image
          src="https://images.unsplash.com/photo-1559847844-5315695dadae"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(174_68%_12%/.86),hsl(174_42%_16%/.34))]" />
        <div className="relative mx-auto flex min-h-[590px] max-w-7xl flex-col justify-center px-4 py-16 text-white">
          <div className="max-w-3xl">
            <Badge className="bg-white/90 text-foreground">{dict.home.badge}</Badge>
            <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-6xl">{dict.home.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/88">
              {dict.home.description}
            </p>
            <div className="mt-8 max-w-4xl text-foreground">
              <SearchBar locale={locale} />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={localizeHref(locale, "/food-map")}>
                  <MapPinned className="h-4 w-4" />
                  {dict.home.startMap}
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href={localizeHref(locale, "/ai-food-assistant")}>
                  <Bot className="h-4 w-4" />
                  {dict.home.askAi}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/60 bg-white/10 text-white hover:bg-white/20">
                <Link href={localizeHref(locale, "/menu-translator")}>
                  <Camera className="h-4 w-4" />
                  {dict.home.translateMenu}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 md:grid-cols-4">
          <Metric icon={Search} label={dict.home.metrics[0][0]} value={dict.home.metrics[0][1]} />
          <Metric icon={Languages} label={dict.home.metrics[1][0]} value={dict.home.metrics[1][1]} />
          <Metric icon={Route} label={dict.home.metrics[2][0]} value={dict.home.metrics[2][1]} />
          <Metric icon={Megaphone} label={dict.home.metrics[3][0]} value={dict.home.metrics[3][1]} />
        </div>
      </section>

      <section className="bg-secondary/55">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col justify-center">
            <Badge className="w-fit bg-primary text-primary-foreground">{dict.home.mapBadge}</Badge>
            <h2 className="mt-4 text-3xl font-semibold md:text-4xl">{dict.home.mapTitle}</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              {dict.home.mapDescription}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {dict.home.mapFilters.map((filter) => (
                <Badge key={filter}>{filter}</Badge>
              ))}
            </div>
            <Button asChild className="mt-7 w-fit">
              <Link href={localizeHref(locale, "/food-map")}>
                {dict.home.viewFullMap}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <DeferredMapView markers={markers} className="h-[430px]" />
        </div>
      </section>

      <Section locale={locale} title={dict.home.popularCities} href="/food-map" viewMore={dict.common.viewMore}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{destinations.map((destination) => <DestinationCard key={destination.id} destination={destination} locale={locale} />)}</div>
      </Section>

      <Section locale={locale} title={dict.home.featuredRestaurants} href="/food-map?featured=true" viewMore={dict.common.viewMore}>
        <div className="grid gap-4 lg:grid-cols-3">{featuredRestaurants.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div>
      </Section>

      <section className="bg-card">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold md:text-3xl">{dict.home.quickCategories}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{dict.home.quickCategoriesDescription}</p>
            </div>
            <Utensils className="hidden h-8 w-8 text-accent md:block" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dict.home.categories.map(([title, desc, href]) => (
              <Link key={title} href={localizeHref(locale, href)} className="rounded-lg border bg-background p-4 transition hover:border-primary hover:bg-secondary">
                <div className="font-semibold">{title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Section locale={locale} title={dict.home.aiTripExamples} href="/ai-trip-planner" viewMore={dict.common.viewMore}>
        <div className="grid gap-4 md:grid-cols-3">{tours.slice(0, 3).map((tour) => <TourCard key={tour.id} tour={tour} locale={locale} />)}</div>
      </Section>

      <section className="bg-secondary/55">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Badge className="bg-accent text-accent-foreground">{dict.home.rankingBadge}</Badge>
            <h2 className="mt-4 text-3xl font-semibold">{dict.home.rankingTitle}</h2>
            <p className="mt-4 leading-7 text-muted-foreground">{dict.home.rankingDescription}</p>
          </div>
          <div className="grid gap-3">
            {leaderboard.map((restaurant, index) => (
              <Link key={restaurant.id} href={localizeHref(locale, `/restaurants/${restaurant.slug}`)} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border bg-card p-4">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold">{restaurant.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{restaurant.destinations?.city} · {restaurant.cuisine_type?.slice(0, 2).join(" / ")}</div>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <Trophy className="h-4 w-4 text-[hsl(var(--warning))]" />
                  {restaurant.rating_avg}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Section locale={locale} title={dict.home.seoTitle} href="/blog" viewMore={dict.common.viewMore}>
        <div className="grid gap-4 md:grid-cols-3">{blogPosts.slice(0, 3).map((post) => <BlogCard key={post.id} post={post} locale={locale} />)}</div>
      </Section>

      <section className="bg-card">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-14 md:grid-cols-2">
          <div className="rounded-lg border p-6">
            <Store className="h-8 w-8 text-primary" />
            <h2 className="mt-4 text-2xl font-semibold">{dict.home.merchantTitle}</h2>
            <p className="mt-3 leading-7 text-muted-foreground">{dict.home.merchantDescription}</p>
            <Button asChild className="mt-5">
              <Link href={localizeHref(locale, "/merchant")}>{dict.home.claimRestaurant}</Link>
            </Button>
          </div>
          <div className="rounded-lg border p-6">
            <Crown className="h-8 w-8 text-accent" />
            <h2 className="mt-4 text-2xl font-semibold">{dict.home.adsTitle}</h2>
            <p className="mt-3 leading-7 text-muted-foreground">{dict.home.adsDescription}</p>
            <Button asChild variant="outline" className="mt-5">
              <Link href={localizeHref(locale, "/merchant-dashboard/ads")}>{dict.home.buyAds}</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Section({ locale, title, href, viewMore, children }: { locale: SupportedLocale; title: string; href: string; viewMore: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
        <Link href={localizeHref(locale, href)} className="text-sm font-medium text-primary hover:underline">
          {viewMore}
        </Link>
      </div>
      {children}
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-md bg-secondary text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-muted-foreground">{value}</span>
      </span>
    </div>
  );
}
