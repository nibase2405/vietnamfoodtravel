import { Badge } from "@/components/ui/badge";
import { CityGuideDirectory } from "@/components/city-guides/CityGuideDirectory";
import { SocialShare } from "@/components/share/SocialShare";
import { getPublicCityGuidesData } from "@/lib/data/queries";
import { getCurrentLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo/metadata";

const pageText = {
  "zh-tw": {
    title: "越南城市美食攻略",
    description: "依城市探索越南餐廳、景點、服務、排行榜與 AI 美食行程。",
    heading: "越南城市美食攻略",
    intro: "用城市入口整理餐廳、景點、服務、醫療資訊、排行榜與 AI 路線規劃，快速找到下一站要吃什麼。",
    restaurants: "餐廳",
    attractions: "景點",
    guide: "查看城市攻略",
    ai: "讓 AI 規劃",
    expansion: "多城市資料擴張"
  },
  en: {
    title: "Vietnam City Food Guides",
    description: "Explore restaurants, attractions, services, medical info, rankings, and AI food trips by Vietnam city.",
    heading: "Vietnam City Food Guides",
    intro: "City-based food guides connect restaurants, attractions, services, medical clinics, rankings, and AI route planning for multi-city expansion.",
    restaurants: "restaurants",
    attractions: "attractions",
    guide: "View city guide",
    ai: "Generate AI trip",
    expansion: "Multi-city expansion"
  }
};

export const revalidate = 300;

function getText(locale: string) {
  return locale === "en" ? pageText.en : pageText["zh-tw"];
}

export async function generateMetadata() {
  const text = getText(await getCurrentLocale());
  return pageMetadata({ title: text.title, description: text.description, path: "/city-guides" });
}

export default async function CityGuidesPage() {
  const locale = await getCurrentLocale();
  const text = getText(locale);
  const guides = await getPublicCityGuidesData(locale);

  return (
    <main>
      <section className="border-b bg-secondary/45">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <Badge className="bg-primary text-primary-foreground">City Guides</Badge>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold md:text-5xl">{text.heading}</h1>
              <p className="mt-4 max-w-3xl leading-8 text-muted-foreground">{text.intro}</p>
            </div>
            <SocialShare title={text.title} text={text.description} />
          </div>
        </div>
      </section>

      <CityGuideDirectory
        initialGuides={guides}
        locale={locale}
        labels={{ restaurants: text.restaurants, attractions: text.attractions, guide: text.guide, ai: text.ai }}
      />

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-2xl font-semibold">{text.expansion}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {guides.map((guide) => (
              <div key={guide.id} className="rounded-lg bg-secondary/70 p-3 text-sm">
                <div className="font-medium">{guide.city}</div>
                <div className="mt-1 text-muted-foreground">
                  {guide.restaurants.length} {text.restaurants} ・ {guide.attractions.length} {text.attractions}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
