import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminUsersData } from "@/lib/data/admin";

export default async function AdminUsersPage() {
  const rows = await getAdminUsersData();
  return <section><AdminPageHeader title="會員管理" description="搜尋姓名、Email、電話，篩選 role/status，修改狀態與權限。" /><div className="mt-6"><AdminDataTable columns={["email", "role", "status"]} rows={rows} getActions={(row) => {
    const id = String(row.id);
    return [
      { label: "Block", endpoint: `/api/admin/users/${id}`, method: "PATCH", payload: { status: "blocked" }, variant: "destructive" },
      { label: "Unblock", endpoint: `/api/admin/users/${id}`, method: "PATCH", payload: { status: "active" } }
    ];
  }} /></div></section>;
}
