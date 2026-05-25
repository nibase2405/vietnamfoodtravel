import Link from "next/link";
import { Card } from "@/components/ui/card";
import { defaultLocale, localizeHref, type SupportedLocale } from "@/lib/i18n/config";
import type { Destination } from "@/types";

const regionLabels: Record<SupportedLocale, Record<Destination["region"], string>> = {
  "zh-tw": { north: "北越", central: "中越", south: "南越" },
  "zh-cn": { north: "北越", central: "中越", south: "南越" },
  en: { north: "Northern Vietnam", central: "Central Vietnam", south: "Southern Vietnam" },
  vi: { north: "Miền Bắc", central: "Miền Trung", south: "Miền Nam" },
  ko: { north: "북부 베트남", central: "중부 베트남", south: "남부 베트남" },
  ja: { north: "北部ベトナム", central: "中部ベトナム", south: "南部ベトナム" }
};

export function DestinationCard({ destination, locale = defaultLocale }: { destination: Destination; locale?: SupportedLocale }) {
  const coverImage = destination.cover_image_url ?? "/placeholder.jpg";

  return (
    <Link href={localizeHref(locale, `/destinations/${destination.slug}`)}>
      <Card className="overflow-hidden">
        <div className="h-40 overflow-hidden bg-muted">
          <img src={coverImage} alt={destination.city} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </div>
        <div className="p-4">
          <div className="font-semibold">{destination.city}</div>
          <div className="text-sm text-muted-foreground">{regionLabels[locale][destination.region]}</div>
        </div>
      </Card>
    </Link>
  );
}
