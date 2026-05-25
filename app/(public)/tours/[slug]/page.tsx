import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { BookingForm } from "@/components/forms/BookingForm";
import { BookingCTA } from "@/components/map/BookingCTA";
import { ImageGallery } from "@/components/map/ImageGallery";
import { MapView } from "@/components/map/MapView";
import { ReviewList } from "@/components/map/ReviewList";
import { AddToTripListButton } from "@/components/map/AddToTripListButton";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublicTourBySlugData } from "@/lib/data/queries";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tour = await getPublicTourBySlugData(slug);
  return pageMetadata({ title: tour?.title ?? "行程詳情", description: "越南行程詳情、價格、地圖與預約。", path: `/tours/${slug}` });
}

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tour = await getPublicTourBySlugData(slug);
  if (!tour) notFound();
  const images = [tour.cover_image_url!, "https://images.unsplash.com/photo-1559847844-5315695dadae", "https://images.unsplash.com/photo-1528127269322-539801943592"];
  return (
    <main>
      <section className="bg-white"><div className="mx-auto max-w-7xl px-4 py-8"><ImageGallery images={images} /><div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"><div><h1 className="text-4xl font-semibold">{tour.title}</h1><p className="mt-3 text-muted-foreground">{tour.destinations?.city} · {tour.duration_days} 天 {tour.duration_nights} 夜 · {tour.currency} {tour.base_price} 起</p><div className="mt-4 flex gap-2">{tour.theme?.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div><div className="mt-8 flex flex-wrap gap-3"><BookingCTA /><AddToTripListButton entityType="tour" entityId={tour.id} title={tour.title} latitude={tour.destinations?.latitude} longitude={tour.destinations?.longitude} /></div></div><BookingForm type="tour" entityId={tour.id} /></div></div></section>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_420px]"><div className="grid gap-6"><Panel title="Day by Day itinerary"><ol className="grid gap-3"><li>Day 1 市區文化散步與咖啡體驗</li><li>Day 2 美食市場與在地街區探索</li><li>Day 3 自由活動與送機</li></ol></Panel><Panel title="包含 / 不包含"><div className="grid gap-2 text-sm"><p>包含：中文導遊、行程規劃、指定接送。</p><p>不包含：國際機票、個人消費、未列明餐食。</p></div></Panel><Panel title="FAQ"><p className="text-sm text-muted-foreground">可依航班與預算調整，送出預約後專人確認。</p></Panel><Panel title="評價"><ReviewList reviews={[{ rating: 5, title: "行程安排流暢", content: "半自助彈性很好，導遊也很準時。" }]} /><div className="mt-5"><ReviewForm entityType="tour" entityId={tour.id} /></div></Panel></div><MapView markers={[{ id: tour.id, title: tour.title, latitude: tour.destinations?.latitude ?? 10.77, longitude: tour.destinations?.longitude ?? 106.7 }]} /></section>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-lg border bg-white p-5"><h2 className="mb-4 text-xl font-semibold">{title}</h2>{children}</div>;
}
