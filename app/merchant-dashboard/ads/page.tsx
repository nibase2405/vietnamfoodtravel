import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdCampaignForm } from "@/components/forms/AdCampaignForm";
import { getMerchantDashboardData } from "@/lib/data/dashboard";

export default async function MerchantAdsPage() {
  const data = await getMerchantDashboardData();
  return <section><h1 className="mb-6 text-2xl font-semibold">廣告活動</h1><div className="rounded-lg border bg-white p-5"><AdCampaignForm /></div><div className="mt-6"><AdminDataTable columns={["title", "placement", "status"]} rows={data.ads} getActions={(row) => [{ label: "Pause", endpoint: `/api/ads/${row.id}`, method: "PATCH", payload: { status: "paused" }, variant: "outline" }, { label: "Activate", endpoint: `/api/ads/${row.id}`, method: "PATCH", payload: { status: "active" } }]} /></div></section>;
}
