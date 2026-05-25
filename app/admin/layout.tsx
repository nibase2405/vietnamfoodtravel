import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { RouteBreadcrumbs } from "@/components/layout/Breadcrumbs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/40">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminTopbar />
        <RouteBreadcrumbs className="bg-card/80" />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
