import { Badge } from "@/components/ui/badge";
import { KOLRecommendationExplorer } from "@/components/kols/KOLRecommendationExplorer";
import { SocialShare } from "@/components/share/SocialShare";
import { getPublicKOLsData } from "@/lib/data/queries";
import { getCurrentLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  return pageMetadata({
    title: "KOL 推薦美食與景點地圖",
    description: "查看越南 KOL 推薦的餐廳、咖啡廳、在地小吃與景點地圖。",
    path: "/kol-recommendations"
  });
}

export default async function KOLRecommendationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const locale = await getCurrentLocale();
  const params = await searchParams;
  const selectedKOL = Array.isArray(params.kol) ? params.kol[0] : params.kol;
  const kols = await getPublicKOLsData();

  return (
    <main>
      <section className="border-b bg-secondary/45">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <Badge className="bg-primary text-primary-foreground">KOL Map</Badge>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold md:text-5xl">KOL 推薦美食與景點地圖</h1>
              <p className="mt-4 max-w-3xl leading-8 text-muted-foreground">
                依 KOL 整理去過的餐廳、咖啡廳、夜市小吃與景點，直接在地圖上查看推薦路線與內容連結。
              </p>
            </div>
            <SocialShare title="KOL 推薦美食與景點地圖" text="查看越南 KOL 推薦的餐廳、景點與地圖路線。" />
          </div>
        </div>
      </section>

      <KOLRecommendationExplorer kols={kols} locale={locale} initialSlug={selectedKOL} />
    </main>
  );
}
