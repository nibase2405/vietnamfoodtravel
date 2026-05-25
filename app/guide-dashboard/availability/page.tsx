import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { GuideAvailabilityForm } from "@/components/forms/GuideAvailabilityForm";
import { getGuideDashboardData } from "@/lib/data/dashboard";

export default async function GuideAvailabilityPage() {
  const data = await getGuideDashboardData();
  return <section><h1 className="mb-6 text-2xl font-semibold">可預約日期</h1><GuideAvailabilityForm guideId={data.guide?.id} /><div className="mt-6"><AdminDataTable columns={["available_date", "start_time", "end_time", "is_available"]} rows={data.availability} getActions={(row) => [{ label: "Close", endpoint: `/api/guide-availability/${row.id}`, method: "PATCH", payload: { is_available: false }, variant: "outline" }, { label: "Open", endpoint: `/api/guide-availability/${row.id}`, method: "PATCH", payload: { is_available: true } }, { label: "Delete", endpoint: `/api/guide-availability/${row.id}`, method: "DELETE", confirm: "Delete this availability?", variant: "destructive" }]} /></div></section>;
}
