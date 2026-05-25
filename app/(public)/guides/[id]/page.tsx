import { notFound } from "next/navigation";
import { BookingForm } from "@/components/forms/BookingForm";
import { Badge } from "@/components/ui/badge";
import { ReviewList } from "@/components/map/ReviewList";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublicGuideByIdData } from "@/lib/data/queries";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guide = await getPublicGuideByIdData(id);
  return pageMetadata({ title: guide?.display_name ?? "導遊詳情", description: "導遊介紹、語言、城市、服務項目與可預約日期。", path: `/guides/${id}` });
}

export default async function GuideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guide = await getPublicGuideByIdData(id);
  if (!guide) notFound();
  return <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_360px]"><section className="rounded-lg border bg-white p-6"><div className="h-24 w-24 rounded-full bg-muted" /><h1 className="mt-5 text-3xl font-semibold">{guide.display_name}</h1><p className="mt-3 text-muted-foreground">{guide.bio}</p><div className="mt-4 flex flex-wrap gap-2">{guide.languages?.map((lang) => <Badge key={lang}>{lang}</Badge>)}</div><h2 className="mt-8 text-xl font-semibold">服務項目</h2><p className="mt-2 text-sm text-muted-foreground">小時計費、半日導遊、全日導遊、機場接送與客製服務。</p><h2 className="mt-8 text-xl font-semibold">評價</h2><ReviewList reviews={[{ rating: 5, title: "中文溝通順暢", content: "路線建議實用，也很懂拍照點。" }]} /><div className="mt-5"><ReviewForm entityType="guide" entityId={guide.id} /></div></section><BookingForm type="guide" entityId={guide.id} /></main>;
}
