import Link from "next/link";
import { ArrowRight, ConciergeBell, MessageCircle, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ServiceList } from "@/components/services/ServiceList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublicServicesData } from "@/lib/data/queries";
import { localizeHref } from "@/lib/i18n/config";
import { getPublicPageCopy } from "@/lib/i18n/public-page-copy";
import { getCurrentLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

export async function generateMetadata() {
  const copy = getPublicPageCopy(await getCurrentLocale()).services;
  return pageMetadata({ title: copy.title, description: copy.description, path: "/services" });
}

export default async function ServicesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const locale = await getCurrentLocale();
  const copy = getPublicPageCopy(locale).services;
  const params = await searchParams;
  const services = await getPublicServicesData(params);

  return (
    <main>
      <section className="bg-secondary/45">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-center">
            <Badge className="w-fit bg-primary text-primary-foreground">{copy.badge}</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal md:text-5xl">{copy.heading}</h1>
            <p className="mt-5 max-w-2xl leading-8 text-muted-foreground">
              {copy.intro}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="#service-list">
                  {copy.view}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={localizeHref(locale, "/contact")}>{copy.contact}</Link>
              </Button>
            </div>
          </div>
          <div className="min-h-[360px] rounded-lg bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1583417319070-4a69db38a482)" }} />
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 md:grid-cols-3">
          <Feature icon={ConciergeBell} title={copy.features[0][0]} description={copy.features[0][1]} />
          <Feature icon={ShieldCheck} title={copy.features[1][0]} description={copy.features[1][1]} />
          <Feature icon={MessageCircle} title={copy.features[2][0]} description={copy.features[2][1]} />
        </div>
      </section>

      <section id="service-list" className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">{copy.listTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{copy.listDescription}</p>
        </div>
        <ServiceList initialServices={services} />
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-secondary text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
      </span>
    </div>
  );
}
