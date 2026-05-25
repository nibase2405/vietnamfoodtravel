import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { RouteBreadcrumbs } from "@/components/layout/Breadcrumbs";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <DashboardSidebar />
      <main className="min-w-0 flex-1">
        <RouteBreadcrumbs className="bg-card/80" />
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
