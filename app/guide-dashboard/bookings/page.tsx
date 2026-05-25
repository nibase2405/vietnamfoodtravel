import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { getGuideDashboardData } from "@/lib/data/dashboard";

export default async function GuideBookingsPage() {
  const data = await getGuideDashboardData();
  return <section><h1 className="mb-6 text-2xl font-semibold">導遊預約</h1>{data.bookings.length ? <AdminDataTable columns={["booking_type", "travel_date", "people_count", "status"]} rows={data.bookings} getActions={(row) => [{ label: "Accept", endpoint: `/api/guide/bookings/${row.id}`, method: "PATCH", payload: { status: "confirmed" } }, { label: "Reject", endpoint: `/api/guide/bookings/${row.id}`, method: "PATCH", payload: { status: "cancelled" }, variant: "destructive" }]} /> : <EmptyState description="可接受或拒絕預約。" />}</section>;
}
