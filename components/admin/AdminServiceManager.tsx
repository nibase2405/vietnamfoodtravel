"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { Eye, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { mergeServices, normalizeService, normalizeServices, serviceCategories, SERVICE_STORAGE_KEY, slugifyServiceTitle } from "@/lib/services";
import type { Service } from "@/types";

function readLocalServices() {
  try {
    return normalizeServices(JSON.parse(window.localStorage.getItem(SERVICE_STORAGE_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

function writeLocalServices(services: Service[]) {
  window.localStorage.setItem(SERVICE_STORAGE_KEY, JSON.stringify(services));
}

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function formatPrice(service: Service) {
  if (!service.price_from) return "依需求報價";
  return `${service.currency} ${new Intl.NumberFormat("en-US").format(service.price_from)} 起`;
}

export function AdminServiceManager({ initialServices }: { initialServices: Record<string, unknown>[] }) {
  const serverServices = useMemo(() => normalizeServices(initialServices), [initialServices]);
  const [localServices, setLocalServices] = useState<Service[]>([]);
  const [status, setStatus] = useState("新增服務後，前台服務頁會立即顯示本機預覽。");
  const [isPending, startTransition] = useTransition();
  const services = mergeServices(serverServices, localServices);

  useEffect(() => {
    setLocalServices(readLocalServices());
  }, []);

  function saveLocal(service: Service) {
    const next = mergeServices(localServices, [service]);
    setLocalServices(next);
    writeLocalServices(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = value(formData, "title");
    const service = normalizeService({
      id: `local-${Date.now()}`,
      title,
      slug: value(formData, "slug") || slugifyServiceTitle(title),
      category: value(formData, "category"),
      city: value(formData, "city"),
      description: value(formData, "description"),
      price_from: value(formData, "price_from"),
      currency: value(formData, "currency") || "USD",
      duration: value(formData, "duration"),
      cover_image_url: value(formData, "cover_image_url"),
      status: value(formData, "status") || "published",
      is_featured: formData.get("is_featured") === "on",
      sort_order: value(formData, "sort_order") || "10",
      cta_label: value(formData, "cta_label") || "預約諮詢",
      cta_href: value(formData, "cta_href") || "/contact",
      tags: value(formData, "tags")
    });

    saveLocal(service);
    setStatus("已新增到本機預覽，正在嘗試同步資料庫...");

    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(service)
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "資料庫同步失敗");
        const synced = normalizeService(body);
        saveLocal(synced);
        setStatus("服務已同步到資料庫。");
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
            <h2 className="text-lg font-semibold">新增服務</h2>
            <p className="mt-1 text-sm text-muted-foreground">設定服務名稱、類別、價格、圖片與 CTA 連結。</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/services" target="_blank">
              <Eye className="h-4 w-4" />
              查看前台
            </Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="title" required placeholder="服務名稱，例如 越南機場接送" />
            <Input name="slug" placeholder="slug，可留空自動產生" />
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <select name="category" defaultValue={serviceCategories[0]} className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
              {serviceCategories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <Input name="city" placeholder="城市，可留空" />
            <Input name="price_from" type="number" min="0" step="1" placeholder="起價" />
            <Input name="currency" defaultValue="USD" placeholder="幣別" />
          </div>
          <Textarea name="description" required placeholder="服務介紹" />
          <div className="grid gap-3 md:grid-cols-3">
            <Input name="duration" placeholder="時間，例如 3-4 小時" />
            <Input name="sort_order" type="number" defaultValue={10} placeholder="排序" />
            <Input name="status" defaultValue="published" placeholder="published / draft / archived" />
          </div>
          <Input name="cover_image_url" placeholder="封面圖片 URL" />
          <div className="grid gap-3 md:grid-cols-3">
            <Input name="cta_label" defaultValue="預約諮詢" placeholder="按鈕文字" />
            <Input name="cta_href" defaultValue="/contact" placeholder="按鈕連結，例如 /contact" />
            <Input name="tags" placeholder="標籤，逗號分隔" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input name="is_featured" type="checkbox" className="h-4 w-4 rounded border" />
            推薦服務
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-sm text-muted-foreground">{status}</p>
            <Button disabled={isPending}>
              <Save className="h-4 w-4" />
              儲存服務
            </Button>
          </div>
        </form>
      </section>

      <section className="grid gap-3">
        <div className="flex items-center gap-2 font-semibold">
          <Plus className="h-4 w-4 text-primary" />
          服務列表
        </div>
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium">title</th>
                <th className="px-4 py-3 font-medium">category</th>
                <th className="px-4 py-3 font-medium">city</th>
                <th className="px-4 py-3 font-medium">price</th>
                <th className="px-4 py-3 font-medium">status</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.slug} className="border-t">
                  <td className="px-4 py-3 font-medium">{service.title}</td>
                  <td className="px-4 py-3">{service.category}</td>
                  <td className="px-4 py-3">{service.city ?? ""}</td>
                  <td className="px-4 py-3">{formatPrice(service)}</td>
                  <td className="px-4 py-3">{service.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
