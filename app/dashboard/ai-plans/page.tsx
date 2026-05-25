import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { getMyAIPlansData } from "@/lib/data/dashboard";

export default async function DashboardAIPlansPage() {
  const rows = await getMyAIPlansData();
  return <section><h1 className="mb-6 text-2xl font-semibold">AI 行程</h1>{rows.length ? <AdminDataTable columns={["estimated_budget", "currency", "created_at"]} rows={rows} /> : <EmptyState description="已儲存 AI 行程與地圖點位會顯示在這裡。" />}</section>;
}
