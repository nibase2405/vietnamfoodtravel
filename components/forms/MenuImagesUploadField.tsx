"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("讀取圖片失敗"));
    reader.readAsDataURL(file);
  });
}

async function uploadMenuImage(file: File) {
  const data = new FormData();
  data.set("file", file);
  try {
    const response = await fetch("/api/admin/menu-images/upload", { method: "POST", body: data });
    const body = await response.json().catch(() => ({}));
    if (response.ok && body.publicUrl) return String(body.publicUrl);
  } catch {
    // Use browser-local data URL in demo mode.
  }
  return fileToDataUrl(file);
}

export function MenuImagesUploadField({ name = "menu_images" }: { name?: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [urls, setUrls] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const value = useMemo(() => JSON.stringify(urls), [urls]);

  return (
    <section className="grid gap-3 rounded-lg border p-4">
      <input type="hidden" name={name} value={value} />
      <Input
        ref={inputRef}
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
              setUrls((current) => [...current, ...uploaded]);
              if (inputRef.current) inputRef.current.value = "";
            })().catch((error) => window.alert(error.message));
          });
        }}
      />
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium">菜單照片</div>
          <p className="mt-1 text-xs text-muted-foreground">僅管理員可上傳菜單照片。正式環境會存到 Supabase Storage，本機預覽會先用瀏覽器暫存。</p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => inputRef.current?.click()}>
          <ImagePlus className="h-4 w-4" />
          上傳菜單
        </Button>
      </div>
      {urls.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {urls.map((url, index) => (
            <div key={`${url}-${index}`} className="overflow-hidden rounded-lg border bg-white">
              <img src={url} alt={`菜單照片 ${index + 1}`} className="h-36 w-full object-cover" />
              <div className="flex items-center justify-between gap-2 p-2">
                <span className="truncate text-xs text-muted-foreground">菜單照片 {index + 1}</span>
                <Button type="button" variant="ghost" size="icon" onClick={() => setUrls((current) => current.filter((_, rowIndex) => rowIndex !== index))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
