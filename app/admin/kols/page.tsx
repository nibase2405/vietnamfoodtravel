import { AdminKOLManager } from "@/components/admin/AdminKOLManager";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminKOLsData } from "@/lib/data/admin";

export default async function AdminKOLsPage() {
  const initialKOLs = await getAdminKOLsData();

  return (
    <section>
      <AdminPageHeader
        title="KOL 推薦管理"
        description="管理 KOL 基本資料、社群連結，以及 KOL 去過的美食與景點地圖資料。"
      />
      <AdminKOLManager initialKOLs={initialKOLs as Record<string, unknown>[]} />
    </section>
  );
}
