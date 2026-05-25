import Link from "next/link";
import { notFound } from "next/navigation";
import { Bot, Clock, ExternalLink, Languages, MapPin, Navigation, Phone, Share2, Sparkles, Star, Store, Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cache, type ReactNode } from "react";
import { AddToTripListButton } from "@/components/map/AddToTripListButton";
import { DeferredMapView } from "@/components/map/DeferredMapView";
import { FavoriteButton } from "@/components/map/FavoriteButton";
import { ImageGallery } from "@/components/map/ImageGallery";
import { ReviewList } from "@/components/map/ReviewList";
import { RestaurantMenuSection } from "@/components/restaurants/RestaurantMenuSection";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublicRestaurantBySlugData, getPublicRestaurantsData } from "@/lib/data/queries";
import { cleanMenuText, normalizeMenuImages, normalizeMenuItems } from "@/lib/menu";

const fallbackDescription = "這家餐廳已收錄於 VietFood Map，可查看位置、價格、菜單、評論摘要並加入行程。";
const statusBadgeBaseClass = "border border-white/90 px-2.5 py-1 font-semibold text-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] ring-1 ring-black/10";
const sponsoredBadgeClass = `${statusBadgeBaseClass} bg-zinc-950`;
const openBadgeClass = `${statusBadgeBaseClass} bg-emerald-700`;
const closedBadgeClass = `${statusBadgeBaseClass} bg-zinc-700`;
const getRestaurant = cache(getPublicRestaurantBySlugData);

export const revalidate = 300;

export async function generateStaticParams() {
  const restaurants = await getPublicRestaurantsData();
  return restaurants.map((restaurant) => ({ slug: restaurant.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);
  return pageMetadata({
    title: restaurant?.name ?? "餐廳資訊",
    description: cleanMenuText(restaurant?.description, fallbackDescription),
    path: `/restaurants/${slug}`
  });
}

export default async function RestaurantDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);
  if (!restaurant) notFound();

  const record = restaurant as Record<string, unknown>;
  const galleryUrls = Array.isArray(restaurant.gallery_urls) ? restaurant.gallery_urls : [];
  const images = [...new Set([...galleryUrls, restaurant.cover_image_url].filter((url): url is string => Boolean(cleanMenuText(url))))];
  const menuItems = normalizeMenuItems(record.restaurant_menu_items ?? restaurant.menu_items);
  const menuImages = normalizeMenuImages(record.menu_images);
  const marker = restaurant.latitude && restaurant.longitude ? [{
    id: restaurant.id,
    title: restaurant.name,
    subtitle: restaurant.address ?? "",
    latitude: restaurant.latitude,
    longitude: restaurant.longitude,
    type: "restaurant" as const
  }] : [];
  const cuisines = cleanList(restaurant.cuisine_type);
  const features = cleanList(restaurant.features);
  const recommendedDishes = cleanList(restaurant.recommended_dishes);
  const languages = cleanList(restaurant.languages);
  const description = cleanMenuText(restaurant.description, fallbackDescription);
  const zhName = cleanMenuText(restaurant.multilingual_names?.["zh-TW"]);
  const spend = formatRestaurantSpend(restaurant);
  const summary = restaurant.ai_review_summary;
  const summaryPros = cleanList(summary?.pros);
  const summaryNotes = cleanList(summary?.notes);
  const summaryDishes = cleanList(summary?.recommended_dishes);
  const summaryBestFor = cleanList(summary?.best_for);
  const plannerParams = new URLSearchParams({ focus: restaurant.name });
  if (restaurant.destinations?.city) plannerParams.set("destination", restaurant.destinations.city);
  const plannerHref = `/ai-trip-planner?${plannerParams.toString()}`;
  const googleMapsDirectionsHref = restaurant.latitude && restaurant.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`
    : "";
  const googleMapsSearchHref = restaurant.latitude && restaurant.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`
    : "";

  return (
    <main className="bg-muted/20">
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link href="/food-map" className="text-muted-foreground hover:text-foreground">美食地圖</Link>
          <div className="flex flex-wrap gap-2">
            {restaurant.sponsored ? <Badge className={sponsoredBadgeClass}>贊助</Badge> : null}
            {restaurant.is_open ? <Badge className={openBadgeClass}>營業中</Badge> : <Badge className={closedBadgeClass}>休息中</Badge>}
          </div>
        </div>

        <ImageGallery images={images.length ? images : ["/placeholder.jpg"]} />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="grid gap-8">
            <header className="grid gap-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-3xl font-semibold tracking-normal md:text-4xl">{restaurant.name}</h1>
                  {zhName ? <p className="mt-2 text-lg text-muted-foreground">{zhName}</p> : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(cuisines.length ? cuisines : ["越南料理"]).slice(0, 5).map((tag) => <Badge key={tag}>{tag}</Badge>)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <FavoriteButton entityType="restaurant" entityId={restaurant.id} />
                  <Button variant="outline" size="icon" aria-label="分享">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Metric icon={Star} label="評分" value={`${restaurant.rating_avg ?? "-"} (${restaurant.review_count ?? 0})`} />
                <Metric icon={Utensils} label="平均消費" value={spend} />
                <Metric icon={Clock} label="營業時間" value={cleanMenuText(restaurant.opening_hours, "待確認")} />
              </div>

              <p className="max-w-3xl leading-8 text-muted-foreground">{description}</p>

              <div className="flex flex-wrap gap-3">
                <AddToTripListButton entityType="restaurant" entityId={restaurant.id} title={restaurant.name} latitude={restaurant.latitude} longitude={restaurant.longitude} />
                {restaurant.latitude && restaurant.longitude ? (
                  <Button asChild>
                    <a href={googleMapsDirectionsHref}>
                      <Navigation className="h-4 w-4" />
                      Google Maps 導航
                    </a>
                  </Button>
                ) : null}
                <Button variant="outline">
                  <Store className="h-4 w-4" />
                  餐廳認領
                </Button>
              </div>
            </header>

            <Panel title="餐廳資訊">
              <div className="grid gap-3 md:grid-cols-2">
                <Info icon={MapPin} label="地址" value={cleanMenuText(restaurant.address, "地址待確認")} />
                <Info icon={Phone} label="電話" value={cleanMenuText(restaurant.phone, "電話待確認")} />
                <Info icon={Languages} label="菜單語言" value={languages.length ? languages.join(" / ") : "語言待確認"} />
                <Info icon={Sparkles} label="推薦菜" value={recommendedDishes.length ? recommendedDishes.join("、") : "推薦菜待確認"} />
              </div>
              {features.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {features.map((feature) => <Badge key={feature}>{feature}</Badge>)}
                </div>
              ) : null}
            </Panel>

            <Panel>
              <RestaurantMenuSection restaurantSlug={restaurant.slug} initialItems={menuItems} initialMenuImages={menuImages} />
            </Panel>

            <Panel title="AI 評論摘要">
              {summary ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <SummaryBlock title="常見優點" items={summaryPros.length ? summaryPros : ["味道穩定", "位置方便"]} />
                  <SummaryBlock title="注意事項" items={summaryNotes.length ? summaryNotes : ["尖峰時段建議提早到店"]} />
                  <SummaryBlock title="大家推薦" items={summaryDishes.length ? summaryDishes : recommendedDishes} />
                  <SummaryBlock title="適合族群" items={summaryBestFor.length ? summaryBestFor : ["旅客", "朋友聚餐"]} />
                  <div className="rounded-lg bg-secondary p-4 text-sm md:col-span-2">
                    預估消費：{cleanMenuText(summary.average_spend, spend)}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">尚未產生 AI 評論摘要。</div>
              )}
            </Panel>

            <Panel title="評論">
              <ReviewList
                reviews={[
                  { rating: 5, title: "招牌菜值得點", content: "味道清楚、上菜速度穩定，第一次來越南旅遊也容易點餐。" },
                  { rating: 4, title: "適合排進美食行程", content: "位置方便，價格資訊清楚，建議避開尖峰用餐時間。" }
                ]}
              />
              <div className="mt-5">
                <ReviewForm entityType="restaurant" entityId={restaurant.id} />
              </div>
            </Panel>
          </section>

          <aside className="grid content-start gap-4 lg:sticky lg:top-20">
            <div className="rounded-lg border bg-white p-4">
              <h2 className="text-lg font-semibold">位置與導航</h2>
              <div className="mt-3">
                <DeferredMapView markers={marker} className="h-80" />
              </div>
              {restaurant.latitude && restaurant.longitude ? (
                <Button asChild className="mt-4 w-full">
                  <a href={googleMapsSearchHref}>
                    <ExternalLink className="h-4 w-4" />
                    在 Google Maps 開啟
                  </a>
                </Button>
              ) : null}
            </div>

            <div className="rounded-lg border bg-white p-5">
              <Bot className="h-8 w-8 text-primary" />
              <h2 className="mt-3 text-xl font-semibold">AI 幫你決定怎麼吃</h2>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                <span>依照預算、距離、營業時間與菜單推薦餐點。</span>
                <span>可把這間餐廳加入一日美食行程。</span>
                <span>贊助推薦會清楚標示，不混淆自然推薦。</span>
              </div>
              <Button asChild className="mt-5 w-full">
                <Link href="/ai-food-assistant">問 AI 推薦</Link>
              </Button>
              <Button asChild variant="outline" className="mt-2 w-full">
                <Link href={plannerHref}>用這間餐廳排美食行程</Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function cleanList(values: unknown) {
  return Array.isArray(values) ? values.map((value) => cleanMenuText(value)).filter(Boolean) : [];
}

function formatRestaurantSpend(restaurant: { price_min?: number | null; price_max?: number | null; average_spend?: string | null; price_range?: string | null }) {
  if (restaurant.price_min && restaurant.price_max) {
    return `${new Intl.NumberFormat("vi-VN").format(restaurant.price_min)}-${new Intl.NumberFormat("vi-VN").format(restaurant.price_max)} VND / 人`;
  }
  return cleanMenuText(restaurant.average_spend) || restaurant.price_range || "價格待確認";
}

function Panel({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border bg-white p-5">
      {title ? <h2 className="mb-4 text-xl font-semibold">{title}</h2> : null}
      {children}
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <div className="mt-2 font-semibold">{value}</div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex gap-3 rounded-lg bg-secondary/60 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 break-words font-medium">{value}</div>
      </div>
    </div>
  );
}

function SummaryBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg bg-secondary/60 p-4">
      <div className="font-medium">{title}</div>
      <ul className="mt-2 grid gap-1 text-sm text-muted-foreground">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}
