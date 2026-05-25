import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminRestaurantClaimsData } from "@/lib/data/admin";

export default async function AdminRestaurantClaimsPage() {
  const rows = await getAdminRestaurantClaimsData();
  return <section><AdminPageHeader title="商家認領審核" description="查看 business license，approve / reject 與 admin note。" /><div className="mt-6"><AdminDataTable columns={["restaurant_id", "contact_name", "status"]} rows={rows} getActions={(row) => {
    const id = String(row.id);
    return [
      { label: "Approve", endpoint: `/api/admin/restaurant-claims/${id}/approve` },
      { label: "Reject", endpoint: `/api/admin/restaurant-claims/${id}/reject`, variant: "destructive" }
    ];
  }} /></div></section>;
}
