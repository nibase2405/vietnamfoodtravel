"use client";

import { useState, useTransition } from "react";
import { Link2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type GoogleBusinessImportResult = {
  name?: string;
  slug?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website_url?: string;
  google_maps_url: string;
  warnings?: string[];
};

export function GoogleBusinessImportField({ onImported }: { onImported: (result: GoogleBusinessImportResult) => void }) {
  const [shareUrl, setShareUrl] = useState("");
  const [result, setResult] = useState<GoogleBusinessImportResult | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <section className="grid gap-3 rounded-lg border bg-secondary/35 p-4">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Link2 className="h-4 w-4 text-primary" />
          從 Google 商家分享連結匯入
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          貼上 Google Maps 或 Google Business 分享連結，系統會帶入可解析的餐廳名稱、地址、座標、電話與 Google Maps 連結。
        </p>
      </div>
      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <Input value={shareUrl} onChange={(event) => setShareUrl(event.target.value)} placeholder="https://maps.app.goo.gl/..." />
        <Button
          type="button"
          disabled={isPending || !shareUrl.trim()}
          onClick={() =>
            startTransition(() => {
              void (async () => {
                const response = await fetch("/api/admin/google-business/import", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ shareUrl })
                });
                const body = await response.json();
                if (!response.ok) throw new Error(body.error ?? "Google 商家資料匯入失敗");
                setResult(body);
                onImported(body);
              })().catch((error) => window.alert(error.message));
            })
          }
        >
          <Sparkles className="h-4 w-4" />
          匯入資料
        </Button>
      </div>
      {result ? (
        <div className="rounded-md bg-white p-3 text-xs leading-5 text-muted-foreground">
          <div className="font-medium text-foreground">{result.name ?? "未解析店名"}</div>
          <div className="break-all">{result.google_maps_url}</div>
          {result.latitude && result.longitude ? <div>座標：{result.latitude}, {result.longitude}</div> : null}
          {result.warnings?.length ? <div className="mt-1 text-accent">{result.warnings.join(" ")}</div> : null}
        </div>
      ) : null}
    </section>
  );
}
