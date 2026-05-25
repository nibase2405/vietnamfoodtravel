import { AdminStatsCard } from "@/components/admin/AdminStatsCard";
import { getMerchantDashboardData } from "@/lib/data/dashboard";

export default async function MerchantDashboardPage() {
  const data = await getMerchantDashboardData();
  return <section><h1 className="mb-6 text-2xl font-semibold">Merchant Dashboard</h1><div className="grid gap-4 md:grid-cols-4"><AdminStatsCard label="已認領餐廳" value={data.restaurants.length} /><AdminStatsCard label="曝光" value={data.impressions} /><AdminStatsCard label="點擊" value={data.clicks} /><AdminStatsCard label="CTR" value={data.ctr} /></div></section>;
}
