import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminGuidesData } from "@/lib/data/admin";

export default async function AdminGuidesPage() {
  const guides = await getAdminGuidesData();
  return <section><AdminPageHeader title="導遊管理" description="審核 pending guide，approve / reject / suspend。" /><div className="mt-6"><AdminDataTable columns={["display_name", "status", "rating_avg"]} rows={guides} getActions={(row) => {
    const id = String(row.id);
    return [
      { label: "Approve", endpoint: `/api/admin/guides/${id}/approve` },
      { label: "Reject", endpoint: `/api/admin/guides/${id}/reject`, variant: "destructive" },
      { label: "Suspend", endpoint: `/api/admin/guides/${id}/suspend`, variant: "outline" }
    ];
  }} /></div></section>;
}
