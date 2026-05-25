import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { getMyFavoritesData } from "@/lib/data/dashboard";

export default async function DashboardFavoritesPage() {
  const rows = await getMyFavoritesData();
  return <section><h1 className="mb-6 text-2xl font-semibold">我的收藏</h1>{rows.length ? <AdminDataTable columns={["entity_type", "entity_id", "created_at"]} rows={rows} getActions={(row) => [{ label: "Remove", endpoint: "/api/favorites", method: "POST", payload: { entity_type: row.entity_type, entity_id: row.entity_id }, variant: "destructive" }]} /> : <EmptyState description="行程、餐廳、景點與導遊收藏會依分類顯示。" />}</section>;
}
