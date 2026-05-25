import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { getAdminBookingsData } from "@/lib/data/admin";

export default async function AdminBookingsPage() {
  const rows = await getAdminBookingsData();
  return <section><AdminPageHeader title="訂單管理" description="篩選 booking_type/status/payment_status，修改狀態並匯出 CSV。" action={<Button asChild variant="outline"><a href="/api/admin/bookings/export">匯出 CSV</a></Button>} /><div className="mt-6"><AdminDataTable columns={["booking_type", "status", "payment_status"]} rows={rows} getActions={(row) => {
    const id = String(row.id);
    return [
      { label: "Confirm", endpoint: `/api/bookings/${id}`, method: "PATCH", payload: { status: "confirmed" } },
      { label: "Complete", endpoint: `/api/bookings/${id}`, method: "PATCH", payload: { status: "completed" } },
      { label: "Paid", endpoint: `/api/bookings/${id}`, method: "PATCH", payload: { payment_status: "paid" } },
      { label: "Cancel", endpoint: `/api/bookings/${id}`, method: "PATCH", payload: { status: "cancelled" }, variant: "destructive" }
    ];
  }} /></div></section>;
}
