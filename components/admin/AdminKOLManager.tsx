"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState, useTransition } from "react";
import { Eye, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { normalizeKOL, normalizeKOLVisit, slugifyKOLName } from "@/lib/kols";
import type { KOL, KOLVisit } from "@/types";

const selectClass = "h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function listText(values: string[] | null | undefined) {
  return values?.join(", ") ?? "";
}

function emptyVisit(index: number): KOLVisit {
  return normalizeKOLVisit({
    id: `local-visit-${Date.now()}-${index}`,
    entity_type: "custom",
    visit_type: "food",
    title: "",
    status: "published",
    sort_order: index
  });
}

function emptyKOL(): KOL {
  return normalizeKOL({
    id: `local-${Date.now()}`,
    name: "New KOL",
    slug: "new-kol",
    status: "draft",
    sort_order: 99,
    visits: [emptyVisit(0)]
  });
}

function isPersisted(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function AdminKOLManager({ initialKOLs }: { initialKOLs: Record<string, unknown>[] }) {
  const normalized = useMemo(() => initialKOLs.map(normalizeKOL), [initialKOLs]);
  const [kols, setKOLs] = useState<KOL[]>(normalized);
  const [selectedSlug, setSelectedSlug] = useState(normalized[0]?.slug ?? "");
  const [status, setStatus] = useState("KOL 資料會儲存在 kols 與 kol_visits 資料表。");
  const [isPending, startTransition] = useTransition();
  const selected = kols.find((kol) => kol.slug === selectedSlug) ?? kols[0];

  function replaceKOL(kol: KOL) {
    setKOLs((current) => {
      const exists = current.some((item) => item.slug === selectedSlug || item.id === kol.id);
      const next = exists ? current.map((item) => item.slug === selectedSlug || item.id === kol.id ? kol : item) : [...current, kol];
      return next.sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    });
    setSelectedSlug(kol.slug);
  }

  function createKOL() {
    const kol = emptyKOL();
    setKOLs((current) => [...current, kol]);
    setSelectedSlug(kol.slug);
    setStatus("已建立 KOL 草稿，填寫後儲存即可同步資料庫。");
  }

  function updateVisit(index: number, patch: Partial<KOLVisit>) {
    if (!selected) return;
    const visits = [...(selected.visits ?? [])];
    visits[index] = normalizeKOLVisit({ ...visits[index], ...patch });
    replaceKOL({ ...selected, visits });
  }

  function addVisit() {
    if (!selected) return;
    replaceKOL({ ...selected, visits: [...(selected.visits ?? []), emptyVisit(selected.visits?.length ?? 0)] });
  }

  function removeVisit(index: number) {
    if (!selected) return;
    replaceKOL({ ...selected, visits: (selected.visits ?? []).filter((_, itemIndex) => itemIndex !== index) });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = value(formData, "name");
    const kol = normalizeKOL({
      ...selected,
      name,
      slug: value(formData, "slug") || slugifyKOLName(name),
      handle: value(formData, "handle"),
      avatar_url: value(formData, "avatar_url"),
      cover_image_url: value(formData, "cover_image_url"),
      bio: value(formData, "bio"),
      city: value(formData, "city"),
      languages: value(formData, "languages"),
      specialty_tags: value(formData, "specialty_tags"),
      social_links: {
        instagram: value(formData, "instagram_url"),
        youtube: value(formData, "youtube_url"),
        tiktok: value(formData, "tiktok_url"),
        website: value(formData, "website_url")
      },
      follower_count: value(formData, "follower_count"),
      status: value(formData, "status"),
      is_featured: formData.get("is_featured") === "on",
      sort_order: value(formData, "sort_order"),
      visits: (selected.visits ?? []).filter((visit) => visit.title.trim())
    });
    replaceKOL(kol);
    setStatus("正在同步 KOL 資料庫...");

    startTransition(() => {
      void (async () => {
        const response = await fetch(isPersisted(selected.id) ? `/api/kols/${encodeURIComponent(selected.slug)}` : "/api/kols", {
          method: isPersisted(selected.id) ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(kol)
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "資料庫同步失敗");
        replaceKOL(normalizeKOL(body));
        setStatus("KOL 資料已同步到資料庫。");
      })().catch((error) => setStatus(`目前只更新畫面；資料庫同步失敗：${error.message}`));
    });
  }

  function deleteKOL() {
    if (!selected) return;
    setKOLs((current) => current.filter((kol) => kol.slug !== selected.slug));
    setSelectedSlug(kols.find((kol) => kol.slug !== selected.slug)?.slug ?? "");
    if (!isPersisted(selected.id)) {
      setStatus("已移除尚未同步的 KOL 草稿。");
      return;
    }
    startTransition(() => {
      void fetch(`/api/kols/${encodeURIComponent(selected.slug)}`, { method: "DELETE" })
        .then(async (response) => {
          if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.error ?? "刪除失敗");
          }
          setStatus("KOL 已從資料庫刪除。");
        })
        .catch((error) => setStatus(`刪除資料庫失敗：${error.message}`));
    });
  }

  if (!selected) {
    return (
      <div className="mt-6 rounded-lg border border-dashed bg-card p-6">
        <p className="text-sm text-muted-foreground">目前沒有 KOL 資料。</p>
        <Button type="button" className="mt-4" onClick={createKOL}>
          <Plus className="h-4 w-4" />
          新增 KOL
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-6">
      <section className="rounded-lg border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">KOL 資料管理</h2>
            <p className="mt-1 text-sm text-muted-foreground">設定 KOL 基本資料、社群連結、語言、專長標籤與去過的餐廳 / 景點。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={createKOL}>
              <Plus className="h-4 w-4" />
              新增
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/kol-recommendations" target="_blank">
                <Eye className="h-4 w-4" />
                查看前台
              </Link>
            </Button>
          </div>
        </div>

        <form key={selected.slug} onSubmit={handleSubmit} className="mt-5 grid gap-5">
          <div className="grid gap-3 md:grid-cols-[1fr_150px_120px]">
            <label className="grid gap-1.5 text-sm font-medium">
              選擇 KOL
              <select value={selectedSlug} onChange={(event) => setSelectedSlug(event.target.value)} className={selectClass}>
                {kols.map((kol) => <option key={kol.slug} value={kol.slug}>{kol.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              狀態
              <select name="status" defaultValue={selected.status} className={selectClass}>
                <option value="published">published</option>
                <option value="draft">draft</option>
                <option value="archived">archived</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              排序
              <Input name="sort_order" type="number" defaultValue={selected.sort_order} />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Input name="name" defaultValue={selected.name} placeholder="KOL 名稱" required />
            <Input name="slug" defaultValue={selected.slug} placeholder="slug，例如 annie-eats-saigon" />
            <Input name="handle" defaultValue={selected.handle ?? ""} placeholder="@handle" />
            <Input name="city" defaultValue={selected.city ?? ""} placeholder="主要城市" />
            <Input name="languages" defaultValue={listText(selected.languages)} placeholder="語言，逗號分隔" />
            <Input name="specialty_tags" defaultValue={listText(selected.specialty_tags)} placeholder="專長標籤，逗號分隔" />
            <Input name="follower_count" type="number" defaultValue={selected.follower_count ?? 0} placeholder="粉絲數" />
            <Input name="avatar_url" defaultValue={selected.avatar_url ?? ""} placeholder="頭像 URL" />
          </div>
          <Input name="cover_image_url" defaultValue={selected.cover_image_url ?? ""} placeholder="封面圖片 URL" />
          <Textarea name="bio" defaultValue={selected.bio ?? ""} rows={3} placeholder="KOL 介紹" />
          <div className="grid gap-3 md:grid-cols-4">
            <Input name="instagram_url" defaultValue={selected.social_links?.instagram ?? ""} placeholder="Instagram URL" />
            <Input name="youtube_url" defaultValue={selected.social_links?.youtube ?? ""} placeholder="YouTube URL" />
            <Input name="tiktok_url" defaultValue={selected.social_links?.tiktok ?? ""} placeholder="TikTok URL" />
            <Input name="website_url" defaultValue={selected.social_links?.website ?? ""} placeholder="Website URL" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input name="is_featured" type="checkbox" defaultChecked={selected.is_featured} className="h-4 w-4 rounded border" />
            精選 KOL
          </label>

          <div className="rounded-lg border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold">去過的地方</h3>
              <Button type="button" variant="outline" size="sm" onClick={addVisit}>
                <Plus className="h-4 w-4" />
                新增地點
              </Button>
            </div>
            <div className="mt-4 grid gap-4">
              {(selected.visits ?? []).map((visit, index) => (
                <div key={visit.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-medium">地點 {index + 1}</div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeVisit(index)}>
                      <Trash2 className="h-4 w-4" />
                      移除
                    </Button>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-4">
                    <select value={visit.entity_type} onChange={(event) => updateVisit(index, { entity_type: event.target.value as KOLVisit["entity_type"] })} className={selectClass}>
                      <option value="restaurant">餐廳</option>
                      <option value="attraction">景點</option>
                      <option value="custom">自訂</option>
                    </select>
                    <select value={visit.visit_type} onChange={(event) => updateVisit(index, { visit_type: event.target.value as KOLVisit["visit_type"] })} className={selectClass}>
                      <option value="food">KOL 美食</option>
                      <option value="attraction">KOL 景點</option>
                    </select>
                    <Input value={visit.restaurant_slug ?? ""} onChange={(event) => updateVisit(index, { restaurant_slug: event.target.value })} placeholder="餐廳 slug" />
                    <Input value={visit.attraction_slug ?? ""} onChange={(event) => updateVisit(index, { attraction_slug: event.target.value })} placeholder="景點 slug" />
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <Input value={visit.title} onChange={(event) => updateVisit(index, { title: event.target.value })} placeholder="地點名稱" />
                    <Input value={visit.city ?? ""} onChange={(event) => updateVisit(index, { city: event.target.value })} placeholder="城市" />
                  </div>
                  <Textarea value={visit.description ?? ""} onChange={(event) => updateVisit(index, { description: event.target.value })} rows={2} placeholder="KOL 推薦說明" className="mt-3" />
                  <Input value={visit.address ?? ""} onChange={(event) => updateVisit(index, { address: event.target.value })} placeholder="地址" className="mt-3" />
                  <div className="mt-3 grid gap-3 md:grid-cols-5">
                    <Input value={visit.latitude ?? ""} onChange={(event) => updateVisit(index, { latitude: event.target.value ? Number(event.target.value) : null })} type="number" step="0.000001" placeholder="緯度" />
                    <Input value={visit.longitude ?? ""} onChange={(event) => updateVisit(index, { longitude: event.target.value ? Number(event.target.value) : null })} type="number" step="0.000001" placeholder="經度" />
                    <Input value={visit.rating ?? ""} onChange={(event) => updateVisit(index, { rating: event.target.value ? Number(event.target.value) : null })} type="number" step="0.1" min="0" max="5" placeholder="評分" />
                    <Input value={visit.sort_order} onChange={(event) => updateVisit(index, { sort_order: Number(event.target.value) })} type="number" placeholder="排序" />
                    <Input value={visit.visited_at ?? ""} onChange={(event) => updateVisit(index, { visited_at: event.target.value })} type="date" />
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <Input value={visit.cover_image_url ?? ""} onChange={(event) => updateVisit(index, { cover_image_url: event.target.value })} placeholder="圖片 URL" />
                    <Input value={visit.content_url ?? ""} onChange={(event) => updateVisit(index, { content_url: event.target.value })} placeholder="KOL 內容連結" />
                    <select value={visit.status} onChange={(event) => updateVisit(index, { status: event.target.value })} className={selectClass}>
                      <option value="published">published</option>
                      <option value="draft">draft</option>
                      <option value="archived">archived</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-sm text-muted-foreground">{status}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="destructive" disabled={isPending} onClick={deleteKOL}>
                <Trash2 className="h-4 w-4" />
                刪除 KOL
              </Button>
              <Button disabled={isPending}>
                <Save className="h-4 w-4" />
                儲存 KOL
              </Button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
