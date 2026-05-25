import { AdminStatsCard } from "@/components/admin/AdminStatsCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminStatsData } from "@/lib/data/admin";

export default async function AdminPage() {
  const stats = await getAdminStatsData();
  const items = [
    ["今日訂單數", stats.todayBookings],
    ["今日 GMV", stats.todayGmv],
    ["本月 GMV", stats.monthGmv],
    ["新會員數", stats.newUsers],
    ["新客製行程詢問", stats.newRequests],
    ["待審核導遊", stats.pendingGuides],
    ["待審核商家認領", stats.pendingClaims],
    ["廣告曝光", stats.adImpressions],
    ["廣告點擊", stats.adClicks]
  ];
  return <section><AdminPageHeader title="Admin Dashboard" description="訂單、GMV、審核與廣告概要。" /><div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-4">{items.map(([label, value]) => <AdminStatsCard key={String(label)} label={String(label)} value={value} />)}</div></section>;
}
