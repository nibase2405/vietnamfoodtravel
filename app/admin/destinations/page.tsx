import Link from "next/link";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { getAdminDestinationsData } from "@/lib/data/admin";

export default async function AdminDestinationsPage() {
  const rows = await getAdminDestinationsData();
  return (
    <section>
      <AdminPageHeader title="目的地管理" description="管理城市、區域、座標、封面、排序與狀態。" action={<Button asChild><Link href="/admin/destinations/new">新增目的地</Link></Button>} />
      <div className="mt-6">
        <AdminDataTable
          columns={["city", "slug", "region", "status"]}
          rows={rows}
          getActions={(row) => {
            const slug = String(row.slug);
            return [
              { label: "Publish", endpoint: `/api/destinations/${slug}`, method: "PATCH", payload: { status: "published" } },
              { label: "Draft", endpoint: `/api/destinations/${slug}`, method: "PATCH", payload: { status: "draft" } },
              { label: "Edit", href: `/admin/destinations/${slug}/edit`, variant: "ghost" },
              { label: "Delete", endpoint: `/api/destinations/${slug}`, method: "DELETE", confirm: "Delete this destination?", variant: "destructive" }
            ];
          }}
        />
      </div>
    </section>
  );
}
