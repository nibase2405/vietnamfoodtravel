import { ReviewList } from "@/components/map/ReviewList";
import { getGuideDashboardData } from "@/lib/data/dashboard";

export default async function GuideReviewsPage() {
  const data = await getGuideDashboardData();
  return <section><h1 className="mb-6 text-2xl font-semibold">我的評價</h1><ReviewList reviews={data.reviews.map((review) => ({ title: String(review.title ?? ""), content: String(review.content ?? ""), rating: Number(review.rating ?? 5) }))} /></section>;
}
