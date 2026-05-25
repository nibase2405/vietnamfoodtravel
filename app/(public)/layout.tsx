import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { RouteBreadcrumbs } from "@/components/layout/Breadcrumbs";
import { getCurrentLocale } from "@/lib/i18n/server";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const locale = await getCurrentLocale();

  return (
    <>
      <SiteHeader locale={locale} />
      <RouteBreadcrumbs />
      {children}
      <SiteFooter locale={locale} />
    </>
  );
}
