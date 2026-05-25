import Link from "next/link";
import { ArrowRight, Award, BarChart3, Filter, MapPinned, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RankingBoard } from "@/components/rankings/RankingBoard";
import { SocialShare } from "@/components/share/SocialShare";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublicRankingConfigsData, getPublicRestaurantsData } from "@/lib/data/queries";
import { buildRankingGroups } from "@/lib/rankings";
import { localizeHref } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  return pageMetadata({
    title: "越南餐廳排行榜",
    description: "查看越南餐廳預訂最多、在地人預訂最多、瀏覽最多、米其林與 CP 值排行榜。",
    path: "/rankings"
  });
}

export default async function RankingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const locale = await getCurrentLocale();
  const params = await searchParams;
  const city = typeof params.city === "string" ? params.city : "";
  const category = typeof params.category === "string" ? params.category : "";
  const restaurants = await getPublicRestaurantsData({ ...(city ? { city } : {}), ...(category ? { cuisine: category } : {}) });
  const groups = buildRankingGroups(restaurants);
  const initialSettings = await getPublicRankingConfigsData();
  const restaurantCount = new Set(groups.flatMap((group) => group.restaurants.map((restaurant) => restaurant.id))).size;
  const cuisineCount = new Set(restaurants.flatMap((restaurant) => restaurant.cuisine_type ?? [])).size;
  const activeFilters = [city ? `城市：${city}` : "", category ? `料理：${category}` : ""].filter(Boolean);

  return (
    <main>
      <section className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <Badge className="border border-border bg-background text-foreground">Rankings</Badge>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">越南餐廳排行榜</h1>
              <p className="mt-4 max-w-3xl leading-8 text-muted-foreground">
                依預訂、瀏覽、在地使用者行為、米其林標籤與 CP 值建立動態榜單。每個榜單可直接查看餐廳頁，或切到地圖模式比較位置與距離。
              </p>
              {activeFilters.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeFilters.map((filter) => <Badge key={filter} className="bg-primary text-primary-foreground">{filter}</Badge>)}
                </div>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={localizeHref(locale, "/food-map?sort=most_booked")}>
                    查看美食地圖
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="#ranking-board">
                    跳到榜單
                    <Trophy className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="grid grid-cols-3 overflow-hidden rounded-lg border bg-background text-center">
                <HeroStat label="榜單" value={groups.length} />
                <HeroStat label="餐廳" value={restaurantCount} />
                <HeroStat label="料理" value={cuisineCount} />
              </div>
              <SocialShare title="越南餐廳排行榜" text="預訂最多、在地人預訂最多、瀏覽最多、米其林與 CP 值排行榜。" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-background">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 md:grid-cols-4">
          <Feature icon={Trophy} title="預訂最多" text="找最多人正在安排的餐廳。" />
          <Feature icon={MapPinned} title="在地人常去" text="參考本地預訂與評論行為。" />
          <Feature icon={BarChart3} title="瀏覽最多" text="快速看近期熱度最高餐廳。" />
          <Feature icon={Award} title="不同料理" text="比較河粉、海鮮、咖啡廳等榜單。" />
        </div>
      </section>

      <section id="ranking-board" className="pt-6">
        <RankingBoard groups={groups} locale={locale} city={city} category={category} initialSettings={initialSettings} />
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-lg border bg-card p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="font-semibold">{title}</div>
        <div className="mt-1 text-sm leading-6 text-muted-foreground">{text}</div>
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-r px-4 py-4 last:border-r-0">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
        <Filter className="h-3 w-3" />
        {label}
      </div>
    </div>
  );
}
