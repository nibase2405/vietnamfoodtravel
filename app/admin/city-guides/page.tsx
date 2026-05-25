import { AdminCityGuideManager } from "@/components/admin/AdminCityGuideManager";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminCityGuidesData } from "@/lib/data/admin";

export default async function AdminCityGuidesPage() {
  const initialGuides = await getAdminCityGuidesData();
  return (
    <section>
      <AdminPageHeader title="城市攻略管理" description="以資料庫 CRUD 管理城市攻略、多語系內容、熱門區域、必吃主題與 SEO 欄位。" />
      <AdminCityGuideManager initialGuides={initialGuides} />
    </section>
  );
}
