import { AdminStatsCard } from "@/components/admin/AdminStatsCard";
import { getGuideDashboardData } from "@/lib/data/dashboard";

export default async function GuideDashboardPage() {
  const data = await getGuideDashboardData();
  return <section><h1 className="mb-6 text-2xl font-semibold">Guide Dashboard</h1><div className="grid gap-4 md:grid-cols-4"><AdminStatsCard label="服務項目" value={data.services.length} /><AdminStatsCard label="可預約日期" value={data.availability.length} /><AdminStatsCard label="預約" value={data.bookings.length} /><AdminStatsCard label="評價" value={data.reviews.length} /></div></section>;
}
