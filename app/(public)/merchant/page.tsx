import Link from "next/link";
import { BarChart3, Bot, CheckCircle2, MapPinned, Megaphone, Store, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentLocale } from "@/lib/i18n/server";
import { localizeHref } from "@/lib/i18n/config";
import { getPublicPageCopy } from "@/lib/i18n/public-page-copy";
import { pageMetadata } from "@/lib/seo/metadata";

const featureIcons = [MapPinned, Upload, Bot, BarChart3];

export async function generateMetadata() {
  const locale = await getCurrentLocale();
  const copy = getPublicPageCopy(locale).merchant;

  return pageMetadata({
    title: copy.title,
    description: copy.description,
    path: "/merchant"
  });
}

export default async function MerchantPage() {
  const locale = await getCurrentLocale();
  const copy = getPublicPageCopy(locale).merchant;

  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Badge className="bg-primary text-primary-foreground">Merchant Platform</Badge>
            <h1 className="mt-4 text-4xl font-semibold md:text-5xl">{copy.heading}</h1>
            <p className="mt-5 max-w-2xl leading-8 text-muted-foreground">{copy.intro}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <Link href={localizeHref(locale, "/merchant-dashboard/claims")}>
                  <Store className="h-4 w-4" />
                  {copy.claim}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={localizeHref(locale, "/merchant-dashboard/ads")}>
                  <Megaphone className="h-4 w-4" />
                  {copy.ads}
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {copy.features.map(([title, value], index) => (
              <Feature key={title} icon={featureIcons[index] ?? CheckCircle2} title={title} value={value} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/55">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-2">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-2xl font-semibold">{copy.claimFlow}</h2>
            <div className="mt-5 grid gap-3">
              {copy.claimSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">{index + 1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-2xl font-semibold">{copy.adTypes}</h2>
            <div className="mt-5 grid gap-3">
              {copy.adPlans.map(([title, desc]) => (
                <div key={title} className="flex gap-3 rounded-lg bg-secondary/60 p-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <div className="font-medium">{title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, value }: { icon: LucideIcon; title: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-5">
      <Icon className="h-7 w-7 text-primary" />
      <div className="mt-4 text-lg font-semibold">{title}</div>
      <div className="mt-2 text-sm text-muted-foreground">{value}</div>
    </div>
  );
}
