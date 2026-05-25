import { AdCampaignForm } from "@/components/forms/AdCampaignForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { getAdminAdsData } from "@/lib/data/admin";

export default async function AdminAdsPage() {
  const ads = await getAdminAdsData();
  return <section><AdminPageHeader title="廣告管理" description="版位、日期、曝光、點擊、暫停與啟用。" /><div className="mt-6 rounded-lg border bg-white p-5"><AdCampaignForm /></div><div className="mt-6"><AdminDataTable columns={["title", "placement", "status"]} rows={ads} getActions={(row) => {
    const id = String(row.id);
    return [
      { label: "Activate", endpoint: `/api/ads/${id}`, method: "PATCH", payload: { status: "active" } },
      { label: "Pause", endpoint: `/api/ads/${id}`, method: "PATCH", payload: { status: "paused" }, variant: "outline" },
      { label: "End", endpoint: `/api/ads/${id}`, method: "PATCH", payload: { status: "ended" }, variant: "destructive" },
      { label: "Delete", endpoint: `/api/ads/${id}`, method: "DELETE", confirm: "Delete this campaign?", variant: "destructive" }
    ];
  }} /></div></section>;
}
