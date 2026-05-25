import Link from "next/link";
import { Bot, MapPinned, Megaphone, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { localizeHref, type SupportedLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function SiteFooter({ locale }: { locale: SupportedLocale }) {
  const dict = getDictionary(locale);

  return (
    <footer className="border-t bg-card pb-20 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <MapPinned className="h-5 w-5 text-primary" />
            {dict.footer.brand}
          </div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            {dict.footer.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-md bg-secondary px-2.5 py-1">繁中</span>
            <span className="rounded-md bg-secondary px-2.5 py-1">简中</span>
            <span className="rounded-md bg-secondary px-2.5 py-1">Tiếng Việt</span>
            <span className="rounded-md bg-secondary px-2.5 py-1">English</span>
            <span className="rounded-md bg-secondary px-2.5 py-1">한국어</span>
            <span className="rounded-md bg-secondary px-2.5 py-1">日本語</span>
          </div>
        </div>
        <FooterGroup locale={locale} title={dict.footer.explore} links={[[dict.nav.foodMap, "/food-map"], [dict.nav.attractions, "/attractions"], [dict.nav.medicalClinics, "/medical-clinics"], [dict.footer.serviceItems, "/services"], [dict.footer.aiRestaurant, "/ai-food-assistant"], [dict.footer.aiTrip, "/ai-trip-planner"], [dict.footer.aiMenu, "/menu-translator"]]} />
        <FooterGroup locale={locale} title={dict.footer.popular} links={[[dict.footer.hcmFood, "/destinations/ho-chi-minh"], [dict.footer.hanoiFood, "/destinations/hanoi"], [dict.footer.danangSeafood, "/destinations/da-nang"], [dict.footer.foodGuides, "/blog"]]} />
        <div>
          <div className="font-medium">{dict.footer.business}</div>
          <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
            <FooterLink locale={locale} href="/merchant" icon={Store} label={dict.footer.claimRestaurant} />
            <FooterLink locale={locale} href="/merchant-dashboard/ads" icon={Megaphone} label={dict.footer.buyAds} />
            <FooterLink locale={locale} href="/admin" icon={Bot} label={dict.footer.admin} />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ locale, title, links }: { locale: SupportedLocale; title: string; links: string[][] }) {
  return (
    <div>
      <div className="font-medium">{title}</div>
      <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
        {links.map(([label, href]) => (
          <Link key={href} href={localizeHref(locale, href)} className="hover:text-foreground">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function FooterLink({ locale, href, icon: Icon, label }: { locale: SupportedLocale; href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={localizeHref(locale, href)} className="flex items-center gap-2 hover:text-foreground">
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
