import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { RouteBreadcrumbs } from "@/components/layout/Breadcrumbs";

export default function GuideDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <DashboardSidebar base="/guide-dashboard" />
      <main className="min-w-0 flex-1">
        <RouteBreadcrumbs className="bg-card/80" />
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
