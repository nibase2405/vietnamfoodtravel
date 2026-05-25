import Link from "next/link";
import { AdminAttractionManager } from "@/components/admin/AdminAttractionManager";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { getAdminAttractionsData } from "@/lib/data/admin";

export default async function AdminAttractionsPage() {
  const attractions = await getAdminAttractionsData();

  return (
    <section>
      <AdminPageHeader
        title="景點管理"
        description="新增景點介紹、分類、座標與封面圖片，前台會用座標呈現附近美食與距離。"
        action={
          <Button asChild variant="outline">
            <Link href="/attractions">查看景點頁</Link>
          </Button>
        }
      />
      <AdminAttractionManager initialAttractions={attractions} />
    </section>
  );
}
