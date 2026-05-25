"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Eye, ImagePlus, Plus, Save, Trash2, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MENU_OVERRIDES_STORAGE_KEY, normalizeMenuImages, normalizeMenuItems, type RestaurantMenuOverride } from "@/lib/menu";

type MenuEditorItem = {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  category: string;
  image_url: string;
};

type RestaurantOption = {
  id: string;
  name: string;
  slug: string;
  menuImages: string[];
  menuItems: MenuEditorItem[];
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function emptyItem(): MenuEditorItem {
  return { id: crypto.randomUUID(), name: "", description: "", price: "", currency: "VND", category: "招牌菜", image_url: "" };
}

function toEditorItems(raw: unknown): MenuEditorItem[] {
  return normalizeMenuItems(raw).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price ? String(item.price) : "",
    currency: item.currency || "VND",
    category: item.category || "招牌菜",
    image_url: item.imageUrl
  }));
}

function readOverrides() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(MENU_OVERRIDES_STORAGE_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed as Record<string, RestaurantMenuOverride> : {};
  } catch {
    return {};
  }
}

function writeOverride(slug: string, menuImages: string[], menuItems: MenuEditorItem[]) {
  const current = readOverrides();
  current[slug] = { menuImages, menuItems, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(MENU_OVERRIDES_STORAGE_KEY, JSON.stringify(current));
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("讀取圖片失敗"));
    reader.readAsDataURL(file);
  });
}

async function uploadMenuImage(file: File) {
  const form = new FormData();
  form.set("file", file);
  try {
    const response = await fetch("/api/admin/menu-images/upload", { method: "POST", body: form });
    const body = await response.json().catch(() => ({}));
    if (response.ok && body.publicUrl) return String(body.publicUrl);
  } catch {
    // Fall back to browser-local preview below.
  }
  return fileToDataUrl(file);
}

export function AdminRestaurantMenuManager({ restaurants }: { restaurants: Record<string, unknown>[] }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const options = useMemo<RestaurantOption[]>(() => {
    return restaurants
      .map((restaurant) => {
        const row = asRecord(restaurant);
        const slug = String(row.slug ?? "");
        if (!slug) return null;
        return {
          id: String(row.id ?? slug),
          name: String(row.name ?? slug),
          slug,
          menuImages: normalizeMenuImages(row.menu_images),
          menuItems: toEditorItems(row.restaurant_menu_items ?? row.menu_items)
        };
      })
      .filter((item): item is RestaurantOption => Boolean(item));
  }, [restaurants]);

  const [selectedSlug, setSelectedSlug] = useState(options[0]?.slug ?? "");
  const selected = options.find((item) => item.slug === selectedSlug) ?? options[0];
  const [menuImages, setMenuImages] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState<MenuEditorItem[]>([emptyItem()]);
  const [status, setStatus] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!selected) return;
    const saved = readOverrides()[selected.slug];
    setMenuImages(saved ? normalizeMenuImages(saved.menuImages) : selected.menuImages);
    const nextItems = saved ? toEditorItems(saved.menuItems) : selected.menuItems;
    setMenuItems(nextItems.length ? nextItems : [emptyItem()]);
    setStatus("");
  }, [selected]);

  function updateItem(id: string, patch: Partial<MenuEditorItem>) {
    setMenuItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function saveMenu() {
    if (!selected) return;
    const validItems = menuItems
      .filter((item) => item.name.trim())
      .map((item) => ({
        ...item,
        price: item.price ? Number(item.price) : 0,
        is_active: true
      }));
    const localItems = menuItems.filter((item) => item.name.trim());
    writeOverride(selected.slug, menuImages, localItems);
    setStatus("已儲存到本機預覽，前台餐廳頁會立即顯示。");

    startTransition(() => {
      void (async () => {
        const response = await fetch(`/api/restaurants/${selected.slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ menu_images: menuImages, restaurant_menu_items: validItems })
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "資料庫同步失敗，已保留本機預覽資料。");
        setStatus(body.demo ? "已儲存本機預覽；目前未連接 Supabase，正式資料庫尚未同步。" : "菜單已同步到資料庫。");
      })().catch((error) => setStatus(error.message));
    });
  }

  if (!selected) {
    return <div className="rounded-lg border bg-white p-5 text-sm text-muted-foreground">尚無餐廳資料可管理。</div>;
  }

  return (
    <section className="mt-6 grid gap-4 rounded-lg border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Utensils className="h-4 w-4" />
            管理員菜單上傳
          </div>
          <h2 className="mt-1 text-lg font-semibold">餐廳菜單、照片與價格</h2>
          <p className="mt-1 text-sm text-muted-foreground">只有管理員後台可新增或修改菜單；前台餐廳頁會讀取這裡儲存的菜單資料。</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/restaurants/${selected.slug}`} target="_blank">
            <Eye className="h-4 w-4" />
            查看前台
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-[280px_1fr]">
        <label className="grid gap-1 text-sm font-medium">
          選擇餐廳
          <select value={selected.slug} onChange={(event) => setSelectedSlug(event.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm">
            {options.map((option) => <option key={option.slug} value={option.slug}>{option.name}</option>)}
          </select>
        </label>
        <div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          目前編輯：<span className="font-medium text-foreground">{selected.name}</span>
        </div>
      </div>

      <div className="grid gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            if (!files.length) return;
            startTransition(() => {
              void (async () => {
                const uploaded = await Promise.all(files.map(uploadMenuImage));
                setMenuImages((current) => [...current, ...uploaded]);
                if (fileInputRef.current) fileInputRef.current.value = "";
              })().catch((error) => setStatus(error.message));
            });
          }}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-medium">菜單照片</div>
            <p className="text-sm text-muted-foreground">可上傳掃描菜單、牆上菜單或店家菜單截圖。</p>
          </div>
          <Button type="button" variant="outline" disabled={isPending} onClick={() => fileInputRef.current?.click()}>
            <ImagePlus className="h-4 w-4" />
            上傳菜單照片
          </Button>
        </div>
        {menuImages.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {menuImages.map((image, index) => (
              <div key={`${image}-${index}`} className="overflow-hidden rounded-lg border">
                <img src={image} alt={`菜單照片 ${index + 1}`} className="h-36 w-full object-cover" />
                <div className="flex items-center justify-between gap-2 p-2">
                  <span className="truncate text-xs text-muted-foreground">菜單照片 {index + 1}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setMenuImages((current) => current.filter((_, imageIndex) => imageIndex !== index))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-medium">菜品資料</div>
            <p className="text-sm text-muted-foreground">前台會顯示菜名、分類、價格、介紹與圖片。</p>
          </div>
          <Button type="button" variant="outline" onClick={() => setMenuItems((current) => [...current, emptyItem()])}>
            <Plus className="h-4 w-4" />
            新增菜品
          </Button>
        </div>
        {menuItems.map((item) => (
          <div key={item.id} className="grid gap-3 rounded-lg border p-3">
            <div className="grid gap-3 md:grid-cols-[1fr_160px_130px_100px_auto]">
              <Input value={item.name} onChange={(event) => updateItem(item.id, { name: event.target.value })} placeholder="菜名，例如 Cha ca" />
              <Input value={item.category} onChange={(event) => updateItem(item.id, { category: event.target.value })} placeholder="分類" />
              <Input value={item.price} onChange={(event) => updateItem(item.id, { price: event.target.value })} placeholder="價格" type="number" />
              <Input value={item.currency} onChange={(event) => updateItem(item.id, { currency: event.target.value })} placeholder="VND" />
              <Button type="button" variant="ghost" size="icon" onClick={() => setMenuItems((current) => current.filter((row) => row.id !== item.id))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea value={item.description} onChange={(event) => updateItem(item.id, { description: event.target.value })} placeholder="菜品介紹、口味或食材" />
            <Input value={item.image_url} onChange={(event) => updateItem(item.id, { image_url: event.target.value })} placeholder="菜品圖片網址，可選填" />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="text-sm text-muted-foreground">{status || "儲存後可到餐廳頁確認顯示效果。"}</p>
        <Button type="button" disabled={isPending} onClick={saveMenu}>
          <Save className="h-4 w-4" />
          儲存菜單
        </Button>
      </div>
    </section>
  );
}
