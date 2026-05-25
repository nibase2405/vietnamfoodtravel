import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminServiceManager } from "@/components/admin/AdminServiceManager";
import { Button } from "@/components/ui/button";
import { getAdminServicesData } from "@/lib/data/admin";

export default async function AdminServicesPage() {
  const services = await getAdminServicesData();

  return (
    <section>
      <AdminPageHeader
        title="服務管理"
        description="新增與管理前台 MENU 的服務頁內容，例如機場接送、簽證協助、上網卡與美食導覽。"
        action={
          <Button asChild variant="outline">
            <Link href="/services">查看服務頁</Link>
          </Button>
        }
      />
      <AdminServiceManager initialServices={services} />
    </section>
  );
}
