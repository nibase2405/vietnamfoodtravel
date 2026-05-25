import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { TripListForm } from "@/components/forms/TripListForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { getMyTripListsData } from "@/lib/data/dashboard";

export default async function DashboardTripListsPage() {
  const rows = await getMyTripListsData();
  return <section><h1 className="mb-6 text-2xl font-semibold">行程清單</h1><TripListForm /><div className="mt-6">{rows.length ? <AdminDataTable columns={["title", "start_date", "end_date", "visibility"]} rows={rows} getActions={(row) => [{ label: "Delete", endpoint: `/api/trip-lists/${row.id}`, method: "DELETE", confirm: "Delete this trip list?", variant: "destructive" }]} /> : <EmptyState description="可加入餐廳、景點、行程，調整排序與日期。" />}</div></section>;
}
