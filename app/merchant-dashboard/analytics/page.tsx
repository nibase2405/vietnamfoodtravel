import { AdminStatsCard } from "@/components/admin/AdminStatsCard";
import { getMerchantDashboardData } from "@/lib/data/dashboard";

export default async function MerchantAnalyticsPage() {
  const data = await getMerchantDashboardData();
  return <section><h1 className="mb-6 text-2xl font-semibold">廣告分析</h1><div className="grid gap-4 md:grid-cols-3"><AdminStatsCard label="曝光" value={data.impressions} /><AdminStatsCard label="點擊" value={data.clicks} /><AdminStatsCard label="CTR" value={data.ctr} /></div></section>;
}
