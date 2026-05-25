"use client";

import Link from "next/link";
import { ArrowRight, Clock, MapPin, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type SupportedLocale } from "@/lib/i18n/config";
import { useCurrentLocale } from "@/lib/i18n/use-current-locale";
import { mergeServices, normalizeServices, SERVICE_STORAGE_KEY } from "@/lib/services";
import type { Service } from "@/types";

const labels: Record<SupportedLocale, { quote: string; from: string; empty: string; featured: string; cta: string }> = {
  "zh-tw": { quote: "依需求報價", from: "起", empty: "目前尚無已上架服務。", featured: "推薦服務", cta: "預約諮詢" },
  "zh-cn": { quote: "依需求报价", from: "起", empty: "目前暂无已上架服务。", featured: "推荐服务", cta: "预约咨询" },
  en: { quote: "Quote on request", from: "from", empty: "No published services yet.", featured: "Featured service", cta: "Book consultation" },
  vi: { quote: "Báo giá theo nhu cầu", from: "từ", empty: "Chưa có dịch vụ đã đăng.", featured: "Dịch vụ nổi bật", cta: "Đặt tư vấn" },
  ko: { quote: "요청 시 견적", from: "부터", empty: "등록된 서비스가 없습니다.", featured: "추천 서비스", cta: "상담 예약" },
  ja: { quote: "要相談", from: "から", empty: "公開中のサービスはまだありません。", featured: "おすすめサービス", cta: "相談予約" }
};

function formatPrice(service: Service, locale: SupportedLocale) {
  if (!service.price_from) return labels[locale].quote;
  return `${service.currency} ${new Intl.NumberFormat("en-US").format(service.price_from)} 起`;
}

function readLocalServices() {
  try {
    return normalizeServices(JSON.parse(window.localStorage.getItem(SERVICE_STORAGE_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

export function ServiceList({ initialServices }: { initialServices: Service[] }) {
  const locale = useCurrentLocale();
  const text = labels[locale];
  const [services, setServices] = useState(initialServices);

  useEffect(() => {
    setServices(mergeServices(initialServices, readLocalServices()).filter((service) => service.status === "published"));
  }, [initialServices]);

  if (!services.length) {
    return <div className="rounded-lg border border-dashed bg-card p-6 text-sm text-muted-foreground">{text.empty}</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => (
        <article key={service.slug} className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="relative h-44 bg-muted">
            <img src={service.cover_image_url ?? "/placeholder.jpg"} alt={service.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              {service.is_featured ? <Badge className="bg-primary text-primary-foreground">{text.featured}</Badge> : null}
              <Badge className="bg-zinc-950 text-white">{service.category}</Badge>
            </div>
          </div>
          <div className="grid gap-4 p-4">
            <div>
              <h2 className="text-lg font-semibold">{service.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{service.description}</p>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground">
              {service.city ? (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {service.city}
                </span>
              ) : null}
              {service.duration ? (
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  {service.duration}
                </span>
              ) : null}
              <span className="flex items-center gap-2 font-medium text-foreground">
                <Tag className="h-4 w-4 text-primary" />
                {service.price_from ? `${service.currency} ${new Intl.NumberFormat("en-US").format(service.price_from)} ${text.from}` : text.quote}
              </span>
            </div>
            {service.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {service.tags.slice(0, 4).map((tag) => <Badge key={tag}>{tag}</Badge>)}
              </div>
            ) : null}
            <Button asChild className="w-full">
              <Link href={service.cta_href ?? "/contact"}>
                {service.cta_label ?? text.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
