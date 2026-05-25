import { AttractionDetailView, LocalAttractionDetail } from "@/components/attractions/AttractionDetailView";
import { getPublicAttractionBySlugData, getPublicRestaurantsData } from "@/lib/data/queries";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const attraction = await getPublicAttractionBySlugData(slug);

  return pageMetadata({
    title: attraction?.name ?? "景點介紹",
    description: attraction ? `${attraction.name} 景點介紹、地圖位置與附近美食距離。` : "越南景點介紹、地圖位置與附近美食距離。",
    path: `/attractions/${slug}`
  });
}

export default async function AttractionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [attraction, restaurants] = await Promise.all([
    getPublicAttractionBySlugData(slug),
    getPublicRestaurantsData()
  ]);

  if (!attraction) {
    return <LocalAttractionDetail slug={slug} restaurants={restaurants} />;
  }

  return <AttractionDetailView attraction={attraction} restaurants={restaurants} />;
}
