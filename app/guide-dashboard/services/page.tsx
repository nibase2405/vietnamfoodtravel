import { GuideServiceForm } from "@/components/forms/GuideServiceForm";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { getGuideDashboardData } from "@/lib/data/dashboard";

export default async function GuideServicesPage() {
  const data = await getGuideDashboardData();
  return <section><h1 className="mb-6 text-2xl font-semibold">服務項目</h1><div className="rounded-lg border bg-white p-5"><GuideServiceForm guideId={data.guide?.id} /></div><div className="mt-6"><AdminDataTable columns={["title", "service_type", "price", "status"]} rows={data.services} getActions={(row) => [{ label: "Disable", endpoint: `/api/guide-services/${row.id}`, method: "PATCH", payload: { status: "inactive" }, variant: "outline" }, { label: "Delete", endpoint: `/api/guide-services/${row.id}`, method: "DELETE", confirm: "Delete this service?", variant: "destructive" }]} /></div></section>;
}
