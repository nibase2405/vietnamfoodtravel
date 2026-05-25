import { GuideApplyForm } from "@/components/forms/GuideApplyForm";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { getGuideDashboardData } from "@/lib/data/dashboard";

export default async function GuideProfilePage() {
  const data = await getGuideDashboardData();
  return <section><h1 className="mb-6 text-2xl font-semibold">導遊資料</h1>{data.guide ? <AdminDataTable columns={["display_name", "status", "hourly_rate", "daily_rate"]} rows={[data.guide]} /> : <div className="rounded-lg border bg-white p-5"><GuideApplyForm /></div>}</section>;
}
