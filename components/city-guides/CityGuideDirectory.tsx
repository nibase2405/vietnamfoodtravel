import Link from "next/link";
import { ArrowRight, MapPinned, Route, Search, Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { localizeHref, type SupportedLocale } from "@/lib/i18n/config";
import type { CityGuide } from "@/lib/city-guides";

type CityGuideView = CityGuide & { status?: string; is_featured?: boolean; sort_order?: number };

export function CityGuideDirectory({
  initialGuides,
  locale,
  labels
}: {
  initialGuides: CityGuide[];
  locale: SupportedLocale;
  labels: { restaurants: string; attractions: string; guide: string; ai: string };
}) {
  const guides: CityGuideView[] = initialGuides;

  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-4 py-10 md:grid-cols-2 xl:grid-cols-3">
      {guides.map((guide) => (
        <article key={guide.slug} className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="relative h-44 bg-muted">
            <img src={guide.cover_image_url} alt={guide.city} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              <Badge className="bg-zinc-950 text-white">{guide.region}</Badge>
              {guide.is_featured ? <Badge className="bg-primary text-primary-foreground">Featured</Badge> : null}
              <Badge className="bg-primary text-primary-foreground">{guide.restaurants.length} {labels.restaurants}</Badge>
            </div>
          </div>
          <div className="grid gap-4 p-4">
            <div>
              <h2 className="text-xl font-semibold">{guide.title || guide.city}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{guide.summary}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <Metric icon={Utensils} label={labels.restaurants} value={guide.restaurants.length} />
              <Metric icon={MapPinned} label={labels.attractions} value={guide.attractions.length} />
              <Metric icon={Search} label="SEO" value={guide.seoKeywords.length} />
            </div>
            <div className="flex flex-wrap gap-2">
              {guide.foodThemes.slice(0, 4).map((theme) => <Badge key={theme}>{theme}</Badge>)}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={localizeHref(locale, `/city-guides/${guide.slug}`)}>
                  {labels.guide}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={localizeHref(locale, `/ai-trip-planner?destination=${encodeURIComponent(guide.city)}`)}>
                  <Route className="h-4 w-4" />
                  {labels.ai}
                </Link>
              </Button>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="rounded-md bg-secondary/70 p-2">
      <Icon className="h-4 w-4 text-primary" />
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
