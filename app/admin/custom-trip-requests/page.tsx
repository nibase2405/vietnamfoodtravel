import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminCustomTripRequestsData } from "@/lib/data/admin";

export default async function AdminCustomTripRequestsPage() {
  const rows = await getAdminCustomTripRequestsData();
  return <section><AdminPageHeader title="客製旅行詢問" description="查看詢問、修改狀態、建立 proposal 與 admin notes。" /><div className="mt-6"><AdminDataTable columns={["name", "email", "status"]} rows={rows} getActions={(row) => {
    const id = String(row.id);
    return [
      { label: "Contacted", endpoint: `/api/custom-trip-requests/${id}`, method: "PATCH", payload: { status: "contacted" } },
      { label: "Quoted", endpoint: `/api/custom-trip-requests/${id}`, method: "PATCH", payload: { status: "quoted" } },
      { label: "Confirmed", endpoint: `/api/custom-trip-requests/${id}`, method: "PATCH", payload: { status: "confirmed" } },
      { label: "Proposal", href: `/admin/custom-trip-proposals?request_id=${id}`, variant: "ghost" },
      { label: "Cancel", endpoint: `/api/custom-trip-requests/${id}`, method: "PATCH", payload: { status: "cancelled" }, variant: "destructive" }
    ];
  }} /></div></section>;
}
