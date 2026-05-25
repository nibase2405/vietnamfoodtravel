import Link from "next/link";
import { ArrowRight, Landmark, MapPinned, Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AttractionExplorer } from "@/components/attractions/AttractionExplorer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { localizeHref } from "@/lib/i18n/config";
import { getPublicPageCopy } from "@/lib/i18n/public-page-copy";
import { getCurrentLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublicAttractionsData } from "@/lib/data/queries";

export const revalidate = 300;

export async function generateMetadata() {
  const copy = getPublicPageCopy(await getCurrentLocale()).attractions;
  return pageMetadata({ title: copy.title, description: copy.description, path: "/attractions" });
}

export default async function AttractionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const locale = await getCurrentLocale();
  const copy = getPublicPageCopy(locale).attractions;
  const attractions = await getPublicAttractionsData(await searchParams);

  return (
    <main>
      <section className="border-b bg-secondary/45">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col justify-center">
            <Badge className="w-fit bg-primary text-primary-foreground">{copy.badge}</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal md:text-5xl">{copy.heading}</h1>
            <p className="mt-5 max-w-2xl leading-8 text-muted-foreground">
              {copy.intro}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="#attraction-list">
                  {copy.explore}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={localizeHref(locale, "/food-map")}>{copy.foodMap}</Link>
              </Button>
            </div>
          </div>
          <div className="min-h-[360px] overflow-hidden rounded-lg bg-muted">
            <img
              src="https://images.unsplash.com/photo-1583417319070-4a69db38a482"
              alt={copy.imageAlt}
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 md:grid-cols-3">
          <Feature icon={Landmark} title={copy.features[0][0]} description={copy.features[0][1]} />
          <Feature icon={Utensils} title={copy.features[1][0]} description={copy.features[1][1]} />
          <Feature icon={MapPinned} title={copy.features[2][0]} description={copy.features[2][1]} />
        </div>
      </section>

      <AttractionExplorer initialAttractions={attractions} />
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
