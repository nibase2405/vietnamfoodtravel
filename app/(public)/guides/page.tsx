import { GuideCard } from "@/components/cards/GuideCard";
import { FilterSidebar } from "@/components/forms/FilterSidebar";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublicGuidesData } from "@/lib/data/queries";

export const metadata = pageMetadata({ title: "越南中文導遊", description: "篩選城市、語言、專長與價格，預約越南導遊／地陪。", path: "/guides" });

export default async function GuidesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const guides = await getPublicGuidesData(await searchParams);
  return <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr]"><FilterSidebar title="導遊篩選" type="guides" /><div><h1 className="mb-5 text-3xl font-semibold">導遊／地陪</h1><div className="grid gap-4 md:grid-cols-2">{guides.map((guide) => <GuideCard key={guide.id} guide={guide} />)}</div></div></main>;
}
