"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { Eye, MapPinned, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ATTRACTION_STORAGE_KEY,
  attractionCategories,
  attractionDestinationOptions,
  mergeAttractions,
  normalizeAttraction,
  normalizeAttractions,
  slugifyAttractionName
} from "@/lib/attractions";
import type { Attraction } from "@/types";

function readLocalAttractions() {
  try {
    return normalizeAttractions(JSON.parse(window.localStorage.getItem(ATTRACTION_STORAGE_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

function writeLocalAttractions(attractions: Attraction[]) {
  window.localStorage.setItem(ATTRACTION_STORAGE_KEY, JSON.stringify(attractions));
}

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function categoryText(attraction: Attraction) {
  return attraction.category?.join(" / ") || "未分類";
}

export function AdminAttractionManager({ initialAttractions }: { initialAttractions: Record<string, unknown>[] }) {
  const serverAttractions = useMemo(() => normalizeAttractions(initialAttractions), [initialAttractions]);
  const [localAttractions, setLocalAttractions] = useState<Attraction[]>([]);
  const [status, setStatus] = useState("新增景點後，前台景點頁與景點詳情頁會立即顯示本機預覽。");
  const [isPending, startTransition] = useTransition();
  const attractions = mergeAttractions(serverAttractions, localAttractions);

  useEffect(() => {
    setLocalAttractions(readLocalAttractions());
  }, []);

  function saveLocal(attraction: Attraction) {
    const next = mergeAttractions(localAttractions, [attraction]);
    setLocalAttractions(next);
    writeLocalAttractions(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = value(formData, "name");
    const slug = value(formData, "slug") || slugifyAttractionName(name);
    const attraction = normalizeAttraction({
      id: `local-${Date.now()}`,
      destination_id: value(formData, "destination_id"),
      name,
      slug,
      category: value(formData, "category"),
      address: value(formData, "address"),
      latitude: value(formData, "latitude"),
      longitude: value(formData, "longitude"),
      cover_image_url: value(formData, "cover_image_url"),
      rating_avg: value(formData, "rating_avg") || "4.3",
      status: value(formData, "status") || "published"
    });

    saveLocal(attraction);
    setStatus("已新增到本機預覽，正在嘗試同步資料庫...");

    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/attractions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attraction)
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "資料庫同步失敗");
        saveLocal(normalizeAttraction(body));
        setStatus("景點已同步到資料庫。");
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
            <h2 className="text-lg font-semibold">新增景點</h2>
            <p className="mt-1 text-sm text-muted-foreground">設定景點名稱、城市、分類、地址、座標與封面圖片。座標會用來計算附近餐廳距離。</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/attractions">
              <Eye className="h-4 w-4" />
              查看前台
            </Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="name" required placeholder="景點名稱，例如 Ben Thanh Market Food Zone" />
            <Input name="slug" placeholder="slug，可留空自動產生" />
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <select name="destination_id" defaultValue="hcm" aria-label="景點城市" className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
              {attractionDestinationOptions.map((destination) => (
                <option key={destination.id} value={destination.id}>{destination.city}</option>
              ))}
            </select>
            <Input name="category" placeholder={`分類，例如 ${attractionCategories.slice(0, 3).join(", ")}`} />
            <Input name="rating_avg" type="number" min="0" max="5" step="0.1" placeholder="評分，例如 4.5" />
            <Input name="status" defaultValue="published" placeholder="published / draft" />
          </div>
          <Input name="address" placeholder="地址" />
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="latitude" required type="number" step="0.000001" placeholder="緯度 latitude" />
            <Input name="longitude" required type="number" step="0.000001" placeholder="經度 longitude" />
          </div>
          <Input name="cover_image_url" placeholder="封面圖片 URL" />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-sm text-muted-foreground">{status}</p>
            <Button disabled={isPending}>
              <Save className="h-4 w-4" />
              儲存景點
            </Button>
          </div>
        </form>
      </section>

      <section className="grid gap-3">
        <div className="flex items-center gap-2 font-semibold">
          <Plus className="h-4 w-4 text-primary" />
          景點列表
        </div>
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium">name</th>
                <th className="px-4 py-3 font-medium">city</th>
                <th className="px-4 py-3 font-medium">category</th>
                <th className="px-4 py-3 font-medium">rating</th>
                <th className="px-4 py-3 font-medium">status</th>
                <th className="px-4 py-3 font-medium">link</th>
              </tr>
            </thead>
            <tbody>
              {attractions.map((attraction) => (
                <tr key={attraction.slug} className="border-t">
                  <td className="px-4 py-3 font-medium">{attraction.name}</td>
                  <td className="px-4 py-3">{attraction.destinations?.city ?? attraction.destination_id ?? ""}</td>
                  <td className="px-4 py-3">{categoryText(attraction)}</td>
                  <td className="px-4 py-3">{attraction.rating_avg ?? ""}</td>
                  <td className="px-4 py-3">{attraction.status}</td>
                  <td className="px-4 py-3">
                    <Link href={`/attractions/${attraction.slug}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                      <MapPinned className="h-3.5 w-3.5" />
                      查看
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
