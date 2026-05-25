import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { RestaurantClaimForm } from "@/components/forms/RestaurantClaimForm";
import { getMerchantDashboardData } from "@/lib/data/dashboard";

export default async function MerchantClaimsPage() {
  const data = await getMerchantDashboardData();
  return <section><h1 className="mb-6 text-2xl font-semibold">餐廳認領</h1><RestaurantClaimForm /><div className="mt-6"><AdminDataTable columns={["restaurant_id", "contact_name", "status"]} rows={data.claims} /></div></section>;
}
