"use client";

import { useEffect, useState } from "react";
import { Camera, FileImage, Languages, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const translatedItems = [
  {
    original: "Bun bo Hue",
    zh: "順化牛肉米線",
    en: "Hue-style beef noodle soup",
    description: "香茅湯底、牛肉、豬腳與米線，通常帶辣味。若不吃辣可先請店家少辣。",
    notes: ["含牛肉", "可能含豬肉", "中辣"]
  },
  {
    original: "Goi cuon tom thit",
    zh: "鮮蝦豬肉生春捲",
    en: "Fresh spring rolls with shrimp and pork",
    description: "米紙包入蝦、豬肉、米線與香草，通常搭配花生醬或魚露。",
    notes: ["含蝦", "含豬肉", "可能含花生"]
  },
  {
    original: "Ca phe sua da",
    zh: "越南冰奶咖啡",
    en: "Vietnamese iced milk coffee",
    description: "越南滴漏咖啡加煉乳與冰塊，甜度高、咖啡味濃。",
    notes: ["含牛奶", "甜度高"]
  }
];

export function MenuTranslatorDemo() {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-lg border bg-white p-5">
        <div className="flex items-center gap-2 font-semibold">
          <Camera className="h-5 w-5 text-primary" />
          上傳菜單照片
        </div>
        <label className="mt-5 grid min-h-72 cursor-pointer place-items-center rounded-lg border border-dashed bg-secondary/45 p-6 text-center hover:border-primary">
          {preview ? (
            <span className="block h-72 w-full rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${preview})` }} />
          ) : (
            <span>
              <FileImage className="mx-auto h-10 w-10 text-primary" />
              <span className="mt-3 block font-medium">選擇越南菜單照片</span>
              <span className="mt-1 block text-sm text-muted-foreground">Demo 會顯示翻譯結果樣式，正式版可串 OCR 與 AI 模型。</span>
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (preview) URL.revokeObjectURL(preview);
              setPreview(URL.createObjectURL(file));
            }}
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          {["繁中", "简中", "English", "한국어", "日本語"].map((language) => <Badge key={language}>{language}</Badge>)}
        </div>
        <Button className="mt-5 w-full">
          <Sparkles className="h-4 w-4" />
          AI 翻譯菜單
        </Button>
      </section>

      <section className="rounded-lg border bg-white p-5">
        <div className="flex items-center gap-2 font-semibold">
          <Languages className="h-5 w-5 text-primary" />
          翻譯結果
        </div>
        <div className="mt-5 grid gap-4">
          {translatedItems.map((item) => (
            <article key={item.original} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">{item.original}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{item.zh} · {item.en}</div>
                </div>
                <Badge className="bg-primary text-primary-foreground">AI 辨識</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.notes.map((note) => <Badge key={note}>{note}</Badge>)}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
