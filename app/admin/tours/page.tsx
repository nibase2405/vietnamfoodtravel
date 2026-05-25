import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminToursData } from "@/lib/data/admin";

export default async function AdminToursPage() {
  const tours = await getAdminToursData();
  return <section><AdminPageHeader title="行程管理" description="新增、編輯、複製、上架下架與刪除行程。" action={<Button asChild><Link href="/admin/tours/new">新增行程</Link></Button>} /><div className="mt-6"><AdminDataTable columns={["title", "slug", "status"]} rows={tours} getActions={(row) => {
    const slug = String(row.slug);
    return [
      { label: "Publish", endpoint: `/api/tours/${slug}`, method: "PATCH", payload: { status: "published" } },
      { label: "Draft", endpoint: `/api/tours/${slug}`, method: "PATCH", payload: { status: "draft" } },
      { label: "Edit", href: `/admin/tours/${row.id}/edit`, variant: "ghost" },
      { label: "Delete", endpoint: `/api/tours/${slug}`, method: "DELETE", confirm: "Delete this tour?", variant: "destructive" }
    ];
  }} /></div></section>;
}
