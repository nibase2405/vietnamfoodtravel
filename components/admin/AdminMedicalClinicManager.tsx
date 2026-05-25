"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { Eye, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MEDICAL_CLINIC_STORAGE_KEY,
  medicalClinicCategories,
  medicalClinicCities,
  mergeMedicalClinics,
  normalizeMedicalClinic,
  normalizeMedicalClinics,
  slugifyMedicalClinicName
} from "@/lib/medical-clinics";
import type { MedicalClinic } from "@/types";

function readLocalClinics() {
  try {
    return normalizeMedicalClinics(JSON.parse(window.localStorage.getItem(MEDICAL_CLINIC_STORAGE_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

function writeLocalClinics(clinics: MedicalClinic[]) {
  window.localStorage.setItem(MEDICAL_CLINIC_STORAGE_KEY, JSON.stringify(clinics));
}

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export function AdminMedicalClinicManager({ initialClinics }: { initialClinics: Record<string, unknown>[] }) {
  const serverClinics = useMemo(() => normalizeMedicalClinics(initialClinics), [initialClinics]);
  const [localClinics, setLocalClinics] = useState<MedicalClinic[]>([]);
  const [status, setStatus] = useState("新增後會立即顯示在前台醫療診所頁本機預覽。");
  const [isPending, startTransition] = useTransition();
  const clinics = mergeMedicalClinics(serverClinics, localClinics);

  useEffect(() => {
    setLocalClinics(readLocalClinics());
  }, []);

  function saveLocal(clinic: MedicalClinic) {
    const next = mergeMedicalClinics(localClinics, [clinic]);
    setLocalClinics(next);
    writeLocalClinics(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = value(formData, "name");
    const clinic = normalizeMedicalClinic({
      id: `local-${Date.now()}`,
      name,
      slug: value(formData, "slug") || slugifyMedicalClinicName(name),
      category: value(formData, "category"),
      description: value(formData, "description"),
      city: value(formData, "city"),
      district: value(formData, "district"),
      address: value(formData, "address"),
      latitude: value(formData, "latitude"),
      longitude: value(formData, "longitude"),
      phone: value(formData, "phone"),
      website: value(formData, "website"),
      opening_hours: value(formData, "opening_hours"),
      languages: value(formData, "languages"),
      services: value(formData, "services"),
      insurance: value(formData, "insurance"),
      price_note: value(formData, "price_note"),
      cover_image_url: value(formData, "cover_image_url"),
      status: value(formData, "status") || "published",
      is_featured: formData.get("is_featured") === "on",
      is_emergency: formData.get("is_emergency") === "on",
      sort_order: value(formData, "sort_order") || "10"
    });

    saveLocal(clinic);
    setStatus("已新增到本機預覽，正在嘗試同步資料庫...");

    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/medical-clinics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clinic)
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "資料庫同步失敗");
        saveLocal(normalizeMedicalClinic(body));
        setStatus("醫療資訊已同步到資料庫。");
        form.reset();
      })().catch((error) => {
        setStatus(`已新增到本機預覽；資料庫未同步（${error.message}）。`);
        form.reset();
      });
    });
  }

  return (
    <div className="mt-6 grid gap-6">
      <section className="grid gap-4 rounded-lg border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">新增醫療資訊</h2>
            <p className="mt-1 text-sm text-muted-foreground">建立診所名稱、科別、語言、聯絡方式、座標與費用備註。</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/medical-clinics">
              <Eye className="h-4 w-4" />
              查看前台
            </Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="name" required placeholder="診所名稱，例如 Saigon Travel Health Clinic" />
            <Input name="slug" placeholder="slug，可留空自動產生" />
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <select name="category" defaultValue={medicalClinicCategories[0]} aria-label="診所科別" className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
              {medicalClinicCategories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <select name="city" defaultValue={medicalClinicCities[0]} aria-label="城市" className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
              {medicalClinicCities.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
            <Input name="district" placeholder="區域，例如 District 1" />
            <Input name="status" defaultValue="published" placeholder="published / draft / archived" />
          </div>
          <Textarea name="description" placeholder="診所簡介與適合旅客查詢的資訊" />
          <Input name="address" placeholder="地址" />
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="latitude" type="number" step="0.000001" placeholder="緯度 latitude" />
            <Input name="longitude" type="number" step="0.000001" placeholder="經度 longitude" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input name="phone" placeholder="電話" />
            <Input name="website" placeholder="網站或預約連結，例如 /contact" />
            <Input name="opening_hours" placeholder="營業時間，例如 08:00-20:00" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="languages" placeholder="語言，逗號分隔，例如 English, Tiếng Việt, 繁中, 简中" />
            <Input name="services" placeholder="服務，逗號分隔，例如 一般門診, 牙科, 轉診協助" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="insurance" placeholder="保險 / 文件備註" />
            <Input name="price_note" placeholder="費用備註" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="cover_image_url" placeholder="封面圖片 URL" />
            <Input name="sort_order" type="number" defaultValue={10} placeholder="排序" />
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input name="is_featured" type="checkbox" className="h-4 w-4 rounded border" />
              推薦顯示
            </label>
            <label className="flex items-center gap-2">
              <input name="is_emergency" type="checkbox" className="h-4 w-4 rounded border" />
              急診協助
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-sm text-muted-foreground">{status}</p>
            <Button disabled={isPending}>
              <Save className="h-4 w-4" />
              儲存醫療資訊
            </Button>
          </div>
        </form>
      </section>

      <section className="grid gap-3">
        <div className="flex items-center gap-2 font-semibold">
          <Plus className="h-4 w-4 text-primary" />
          醫療資訊列表
        </div>
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium">name</th>
                <th className="px-4 py-3 font-medium">city</th>
                <th className="px-4 py-3 font-medium">category</th>
                <th className="px-4 py-3 font-medium">languages</th>
                <th className="px-4 py-3 font-medium">status</th>
              </tr>
            </thead>
            <tbody>
              {clinics.map((clinic) => (
                <tr key={clinic.slug} className="border-t">
                  <td className="px-4 py-3 font-medium">{clinic.name}</td>
                  <td className="px-4 py-3">{clinic.city ?? ""}</td>
                  <td className="px-4 py-3">{clinic.category}</td>
                  <td className="px-4 py-3">{clinic.languages?.join(" / ") ?? ""}</td>
                  <td className="px-4 py-3">{clinic.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
