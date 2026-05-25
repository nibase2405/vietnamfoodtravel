import Link from "next/link";
import { AdminRestaurantCreatePanel } from "@/components/admin/AdminRestaurantCreatePanel";
import { AdminRestaurantFilterSettings } from "@/components/admin/AdminRestaurantFilterSettings";
import { AdminRestaurantMenuManager } from "@/components/admin/AdminRestaurantMenuManager";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { getAdminRestaurantsData } from "@/lib/data/admin";

export default async function AdminRestaurantsPage() {
  const restaurants = await getAdminRestaurantsData();

  return (
    <section>
      <AdminPageHeader
        title="餐廳管理"
        description="管理餐廳資料、Google 商家匯入、餐廳篩選、菜單照片與菜品價格。菜單上傳僅開放管理員後台使用。"
        action={
          <Button asChild variant="outline">
            <Link href="/food-map">返回美食地圖</Link>
          </Button>
        }
      />
      <AdminRestaurantFilterSettings />
      <AdminRestaurantMenuManager restaurants={restaurants} />
      <AdminRestaurantCreatePanel />
      <div className="mt-6">
        <AdminDataTable columns={["name", "slug", "status"]} rows={restaurants} getActions={(row) => {
          const slug = String(row.slug);
          return [
            { label: "Publish", endpoint: `/api/restaurants/${slug}`, method: "PATCH", payload: { status: "published" } },
            { label: "Draft", endpoint: `/api/restaurants/${slug}`, method: "PATCH", payload: { status: "draft" } },
            { label: "Close", endpoint: `/api/restaurants/${slug}`, method: "PATCH", payload: { status: "closed" }, variant: "outline" },
            { label: "Delete", endpoint: `/api/restaurants/${slug}`, method: "DELETE", confirm: "Delete this restaurant?", variant: "destructive" }
          ];
        }} />
      </div>
    </section>
  );
}
