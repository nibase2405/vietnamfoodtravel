"use client";

import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FavoriteButton } from "@/components/map/FavoriteButton";
import { AddToTripListButton } from "@/components/map/AddToTripListButton";
import { localizeHref } from "@/lib/i18n/config";
import { useCurrentLocale } from "@/lib/i18n/use-current-locale";
import type { Attraction } from "@/types";

export function AttractionCard({ attraction }: { attraction: Attraction }) {
  const locale = useCurrentLocale();
  const coverImage = attraction.cover_image_url ?? "/placeholder.jpg";

  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 overflow-hidden bg-muted">
        <img src={coverImage} alt={attraction.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        <FavoriteButton entityType="attraction" entityId={attraction.id} className="absolute right-3 top-3 z-10" />
      </div>
      <div className="grid gap-2 p-4">
        <Link href={localizeHref(locale, `/attractions/${attraction.slug}`)} className="font-semibold hover:underline">{attraction.name}</Link>
        <div className="flex items-center gap-1 text-sm text-muted-foreground"><Star className="h-3.5 w-3.5 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />{attraction.rating_avg}</div>
        <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{attraction.address}</p>
        <AddToTripListButton entityType="attraction" entityId={attraction.id} title={attraction.name} latitude={attraction.latitude} longitude={attraction.longitude} />
      </div>
    </Card>
  );
}
