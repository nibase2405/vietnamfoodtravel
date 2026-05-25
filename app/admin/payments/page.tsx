import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminPaymentsData } from "@/lib/data/admin";

export default async function AdminPaymentsPage() {
  const rows = await getAdminPaymentsData();
  return <section><AdminPageHeader title="付款紀錄" description="對帳、手動標記付款成功與退款狀態管理。" /><div className="mt-6"><AdminDataTable columns={["provider", "amount", "status"]} rows={rows} getActions={(row) => {
    const id = String(row.id);
    return [
      { label: "Success", endpoint: `/api/payments/${id}`, method: "PATCH", payload: { status: "success" } },
      { label: "Failed", endpoint: `/api/payments/${id}`, method: "PATCH", payload: { status: "failed" }, variant: "outline" },
      { label: "Refunded", endpoint: `/api/payments/${id}`, method: "PATCH", payload: { status: "refunded" }, variant: "destructive" }
    ];
  }} /></div></section>;
}
