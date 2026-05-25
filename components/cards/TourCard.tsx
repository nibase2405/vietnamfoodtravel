import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FavoriteButton } from "@/components/map/FavoriteButton";
import { AddToTripListButton } from "@/components/map/AddToTripListButton";
import { defaultLocale, localizeHref, type SupportedLocale } from "@/lib/i18n/config";
import type { Tour } from "@/types";

const tourLabels: Record<SupportedLocale, { day: string; view: string }> = {
  "zh-tw": { day: "天", view: "查看行程" },
  "zh-cn": { day: "天", view: "查看行程" },
  en: { day: "days", view: "View tour" },
  vi: { day: "ngày", view: "Xem tour" },
  ko: { day: "일", view: "일정 보기" },
  ja: { day: "日", view: "旅程を見る" }
};

export function TourCard({ tour, locale = defaultLocale }: { tour: Tour; locale?: SupportedLocale }) {
  const coverImage = tour.cover_image_url ?? "/placeholder.jpg";
  const labels = tourLabels[locale];

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 overflow-hidden bg-muted">
        <img src={coverImage} alt={tour.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        <FavoriteButton entityType="tour" entityId={tour.id} className="absolute right-3 top-3 z-10" />
      </div>
      <div className="grid gap-3 p-4">
        <div>
          <h3 className="font-semibold">{tour.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {tour.destinations?.city ?? "Vietnam"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">{tour.theme?.slice(0, 3).map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm">
            <span className="font-semibold">{tour.currency} {tour.base_price}</span>
            <span className="ml-2 inline-flex items-center gap-1 text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {tour.duration_days} {labels.day}
            </span>
          </div>
          <Button asChild size="sm">
            <Link href={localizeHref(locale, `/tours/${tour.slug}`)}>{labels.view}</Link>
          </Button>
        </div>
        <AddToTripListButton entityType="tour" entityId={tour.id} title={tour.title} latitude={tour.destinations?.latitude} longitude={tour.destinations?.longitude} />
      </div>
    </Card>
  );
}
