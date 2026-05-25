import { RouteBreadcrumbs } from "@/components/layout/Breadcrumbs";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteBreadcrumbs />
      {children}
    </>
  );
}
