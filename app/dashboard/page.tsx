import { AdminStatsCard } from "@/components/admin/AdminStatsCard";
import { getUserDashboardStatsData } from "@/lib/data/dashboard";

export default async function DashboardPage() {
  const stats = await getUserDashboardStatsData();
  return <section><h1 className="mb-6 text-2xl font-semibold">會員中心</h1><div className="grid gap-4 md:grid-cols-4"><AdminStatsCard label="即將出發訂單" value={stats.upcomingBookings} /><AdminStatsCard label="收藏數" value={stats.favorites} /><AdminStatsCard label="行程清單" value={stats.tripLists} /><AdminStatsCard label="AI 行程" value={stats.aiPlans} /></div></section>;
}
