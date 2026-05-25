import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { getMyBookingsData } from "@/lib/data/dashboard";

export default async function DashboardBookingsPage() {
  const rows = await getMyBookingsData();
  return <section><h1 className="mb-6 text-2xl font-semibold">我的訂單</h1>{rows.length ? <AdminDataTable columns={["booking_type", "travel_date", "status", "payment_status"]} rows={rows} /> : <EmptyState description="訂單狀態與付款狀態會顯示在這裡。" />}</section>;
}
