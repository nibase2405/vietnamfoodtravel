import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminReviewsData } from "@/lib/data/admin";

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviewsData();
  return (
    <section>
      <AdminPageHeader title="評價管理" description="審核使用者提交的 tour / guide / restaurant / attraction 評價。" />
      <div className="mt-6">
        <AdminDataTable
          columns={["entity_type", "rating", "title", "status"]}
          rows={reviews}
          getActions={(row) => {
            const id = String(row.id);
            return [
              { label: "Publish", endpoint: `/api/reviews/${id}`, method: "PATCH", payload: { status: "published" } },
              { label: "Hide", endpoint: `/api/reviews/${id}`, method: "PATCH", payload: { status: "hidden" }, variant: "outline" },
              { label: "Delete", endpoint: `/api/reviews/${id}`, method: "DELETE", confirm: "Delete this review?", variant: "destructive" }
            ];
          }}
        />
      </div>
    </section>
  );
}
