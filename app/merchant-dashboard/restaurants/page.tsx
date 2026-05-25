import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { getMerchantDashboardData } from "@/lib/data/dashboard";

export default async function MerchantRestaurantsPage() {
  const data = await getMerchantDashboardData();
  return <section><h1 className="mb-6 text-2xl font-semibold">已認領餐廳</h1>{data.restaurants.length ? <AdminDataTable columns={["name", "slug", "status"]} rows={data.restaurants} getActions={(row) => [{ label: "Publish", endpoint: `/api/restaurants/${row.slug}`, method: "PATCH", payload: { status: "published" } }, { label: "Close", endpoint: `/api/restaurants/${row.slug}`, method: "PATCH", payload: { status: "closed" }, variant: "outline" }]} /> : <EmptyState description="通過認領審核的餐廳會顯示在這裡。" />}</section>;
}
