import Link from "next/link";
import { AdminMedicalClinicManager } from "@/components/admin/AdminMedicalClinicManager";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { getAdminMedicalClinicsData } from "@/lib/data/admin";

export default async function AdminMedicalClinicsPage() {
  const clinics = await getAdminMedicalClinicsData();

  return (
    <section>
      <AdminPageHeader
        title="醫療資訊管理"
        description="新增與管理前台醫療診所頁內容，例如診所科別、語言、聯絡方式、座標、保險與費用備註。"
        action={
          <Button asChild variant="outline">
            <Link href="/medical-clinics">查看醫療診所頁</Link>
          </Button>
        }
      />
      <AdminMedicalClinicManager initialClinics={clinics} />
    </section>
  );
}
