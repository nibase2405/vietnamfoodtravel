import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CustomTripProposalForm } from "@/components/forms/CustomTripProposalForm";
import { getAdminCustomTripProposalsData } from "@/lib/data/admin";

export default async function AdminCustomTripProposalsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const requestId = typeof params.request_id === "string" ? params.request_id : undefined;
  const rows = await getAdminCustomTripProposalsData();
  return (
    <section>
      <AdminPageHeader title="客製旅行報價" description="建立 proposal，管理 sent / accepted / rejected 狀態。" />
      <div className="mt-6"><CustomTripProposalForm requestId={requestId} /></div>
      <div className="mt-6">
        <AdminDataTable
          columns={["title", "quoted_price", "currency", "status"]}
          rows={rows}
          getActions={(row) => {
            const id = String(row.id);
            return [
              { label: "Send", endpoint: `/api/custom-trip-proposals/${id}`, method: "PATCH", payload: { status: "sent" } },
              { label: "Accept", endpoint: `/api/custom-trip-proposals/${id}`, method: "PATCH", payload: { status: "accepted" } },
              { label: "Reject", endpoint: `/api/custom-trip-proposals/${id}`, method: "PATCH", payload: { status: "rejected" }, variant: "destructive" },
              { label: "Delete", endpoint: `/api/custom-trip-proposals/${id}`, method: "DELETE", confirm: "Delete this proposal?", variant: "destructive" }
            ];
          }}
        />
      </div>
    </section>
  );
}
