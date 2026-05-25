"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type HrefRow = { lang: string; url: string };

export function HreflangEditor({ name = "hreflang" }: { name?: string }) {
  const [rows, setRows] = useState<HrefRow[]>([
    { lang: "zh-TW", url: "" },
    { lang: "zh-CN", url: "" },
    { lang: "en", url: "" },
    { lang: "vi", url: "" }
  ]);
  const value = useMemo(() => JSON.stringify(Object.fromEntries(rows.filter((row) => row.lang && row.url).map((row) => [row.lang, row.url]))), [rows]);

  return (
    <div className="grid gap-3">
      <input type="hidden" name={name} value={value} />
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Hreflang</div>
        <Button type="button" variant="outline" size="sm" onClick={() => setRows((current) => [...current, { lang: "", url: "" }])}><Plus className="h-4 w-4" />Add</Button>
      </div>
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 md:grid-cols-[140px_1fr_auto]">
          <Input value={row.lang} onChange={(event) => setRows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, lang: event.target.value } : item))} placeholder="zh-TW" />
          <Input value={row.url} onChange={(event) => setRows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item))} placeholder="https://..." />
          <Button type="button" variant="ghost" size="icon" onClick={() => setRows((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
    </div>
  );
}
