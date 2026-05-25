"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Clock, Languages, MapPin, Phone, ShieldCheck, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapView } from "@/components/map/MapView";
import { type SupportedLocale } from "@/lib/i18n/config";
import { useCurrentLocale } from "@/lib/i18n/use-current-locale";
import { MEDICAL_CLINIC_STORAGE_KEY, mergeMedicalClinics, normalizeMedicalClinics } from "@/lib/medical-clinics";
import type { MedicalClinic } from "@/types";

const labels: Record<SupportedLocale, {
  empty: string;
  featured: string;
  emergency: string;
  insuranceFallback: string;
  consult: string;
  map: string;
  clinicMap: string;
}> = {
  "zh-tw": { empty: "目前尚無符合條件的醫療診所資訊。", featured: "推薦", emergency: "急診協助", insuranceFallback: "保險與費用請以診所官方確認為準。", consult: "預約 / 諮詢", map: "地圖", clinicMap: "診所地圖" },
  "zh-cn": { empty: "目前暂无符合条件的医疗诊所信息。", featured: "推荐", emergency: "急诊协助", insuranceFallback: "保险与费用请以诊所官方确认为准。", consult: "预约 / 咨询", map: "地图", clinicMap: "诊所地图" },
  en: { empty: "No medical clinics match these filters yet.", featured: "Featured", emergency: "Emergency support", insuranceFallback: "Confirm insurance and fees with the clinic.", consult: "Book / Consult", map: "Map", clinicMap: "Clinic map" },
  vi: { empty: "Chưa có phòng khám phù hợp với bộ lọc.", featured: "Nổi bật", emergency: "Hỗ trợ khẩn cấp", insuranceFallback: "Vui lòng xác nhận bảo hiểm và chi phí với phòng khám.", consult: "Đặt lịch / Tư vấn", map: "Bản đồ", clinicMap: "Bản đồ phòng khám" },
  ko: { empty: "조건에 맞는 의료 클리닉 정보가 없습니다.", featured: "추천", emergency: "응급 지원", insuranceFallback: "보험 및 비용은 클리닉에 직접 확인해 주세요.", consult: "예약 / 상담", map: "지도", clinicMap: "클리닉 지도" },
  ja: { empty: "条件に合う医療クリニック情報はまだありません。", featured: "おすすめ", emergency: "救急対応", insuranceFallback: "保険と費用はクリニックに直接確認してください。", consult: "予約 / 相談", map: "地図", clinicMap: "クリニック地図" }
};

function readLocalClinics() {
  try {
    return normalizeMedicalClinics(JSON.parse(window.localStorage.getItem(MEDICAL_CLINIC_STORAGE_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

function includesText(value: unknown, keyword: string) {
  return String(value ?? "").toLowerCase().includes(keyword.toLowerCase());
}

function listIncludes(values: string[] | null, keyword: string) {
  return Array.isArray(values) && values.some((value) => includesText(value, keyword));
}

function matchesFilters(clinic: MedicalClinic, filters: Record<string, string>) {
  return (
    (!filters.q || includesText(clinic.name, filters.q) || includesText(clinic.description, filters.q) || listIncludes(clinic.services, filters.q)) &&
    (!filters.city || includesText(clinic.city, filters.city)) &&
    (!filters.category || includesText(clinic.category, filters.category)) &&
    (!filters.language || listIncludes(clinic.languages, filters.language)) &&
    (!filters.emergency || clinic.is_emergency === (filters.emergency === "true"))
  );
}

function mapsHref(clinic: MedicalClinic) {
  if (clinic.latitude && clinic.longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${clinic.latitude},${clinic.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${clinic.name} ${clinic.address ?? ""}`)}`;
}

export function MedicalClinicList({ initialClinics }: { initialClinics: MedicalClinic[] }) {
  const locale = useCurrentLocale();
  const text = labels[locale];
  const searchParams = useSearchParams();
  const [localClinics, setLocalClinics] = useState<MedicalClinic[]>([]);
  const filters = useMemo(() => ({
    q: searchParams.get("q") ?? "",
    city: searchParams.get("city") ?? "",
    category: searchParams.get("category") ?? "",
    language: searchParams.get("language") ?? "",
    emergency: searchParams.get("emergency") ?? ""
  }), [searchParams]);

  useEffect(() => {
    setLocalClinics(readLocalClinics());
  }, []);

  const clinics = useMemo(() => {
    return mergeMedicalClinics(initialClinics, localClinics)
      .filter((clinic) => clinic.status === "published")
      .filter((clinic) => matchesFilters(clinic, filters));
  }, [filters, initialClinics, localClinics]);

  const markers = clinics
    .filter((clinic): clinic is MedicalClinic & { latitude: number; longitude: number } => typeof clinic.latitude === "number" && typeof clinic.longitude === "number")
    .map((clinic) => ({
      id: clinic.id,
      title: clinic.name,
      subtitle: `${clinic.city ?? "Vietnam"} · ${clinic.category}`,
      latitude: clinic.latitude,
      longitude: clinic.longitude,
      type: "medical" as const
    }));

  if (!clinics.length) {
    return <div className="rounded-lg border border-dashed bg-card p-6 text-sm text-muted-foreground">{text.empty}</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="grid gap-4 md:grid-cols-2">
        {clinics.map((clinic) => (
          <article key={clinic.slug} className="overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="relative h-44 bg-muted">
              <img src={clinic.cover_image_url ?? "/placeholder.jpg"} alt={clinic.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
              <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                {clinic.is_featured ? <Badge className="bg-primary text-primary-foreground">{text.featured}</Badge> : null}
                {clinic.is_emergency ? <Badge className="bg-destructive text-destructive-foreground">{text.emergency}</Badge> : null}
                <Badge className="bg-white text-slate-900">{clinic.category}</Badge>
              </div>
            </div>
            <div className="grid gap-4 p-4">
              <div>
                <h2 className="text-lg font-semibold">{clinic.name}</h2>
                {clinic.description ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{clinic.description}</p> : null}
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <span className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {clinic.city}{clinic.district ? ` · ${clinic.district}` : ""}{clinic.address ? ` · ${clinic.address}` : ""}
                </span>
                {clinic.opening_hours ? (
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    {clinic.opening_hours}
                  </span>
                ) : null}
                {clinic.phone ? (
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    {clinic.phone}
                  </span>
                ) : null}
                {clinic.languages?.length ? (
                  <span className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-primary" />
                    {clinic.languages.join(" / ")}
                  </span>
                ) : null}
              </div>
              {clinic.services?.length ? (
                <div className="flex flex-wrap gap-2">
                  {clinic.services.slice(0, 5).map((service) => <Badge key={service}>{service}</Badge>)}
                </div>
              ) : null}
              <div className="rounded-md bg-secondary p-3 text-xs leading-5 text-secondary-foreground">
                <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
                {clinic.insurance ?? text.insuranceFallback}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild className="flex-1">
                  <a href={clinic.website ?? "/contact"}>{text.consult}</a>
                </Button>
                <Button asChild variant="outline">
                  <a href={mapsHref(clinic)}>{text.map}</a>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <aside className="grid content-start gap-3 lg:sticky lg:top-24">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Stethoscope className="h-4 w-4 text-primary" />
          {text.clinicMap}
        </div>
        <MapView markers={markers} className="h-[620px]" />
      </aside>
    </div>
  );
}
