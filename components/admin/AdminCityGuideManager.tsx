"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Eye, Languages, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { normalizeCityGuideRecord, type CityGuideRecord, type CityGuideTranslationRecord } from "@/lib/city-guide-records";

const languageOptions = [
  ["zh-tw", "繁體中文"],
  ["zh-cn", "簡體中文"],
  ["en", "English"],
  ["vi", "Tiếng Việt"],
  ["ko", "한국어"],
  ["ja", "日本語"]
] as const;

const selectClass = "h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function listText(values: string[] | undefined) {
  return values?.join(", ") ?? "";
}

function splitList(text: string) {
  return text.split(",").map((item) => item.trim()).filter(Boolean);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function blankGuide(): CityGuideRecord {
  return {
    id: `draft-${Date.now()}`,
    destination_slug: "",
    city: "",
    slug: "new-city-guide",
    region: "south",
    latitude: 0,
    longitude: 0,
    cover_image_url: "",
    food_themes: [],
    districts: [],
    suggested_plan: [],
    seo_keywords: [],
    status: "draft",
    is_featured: false,
    sort_order: 99,
    translations: [
      {
        language_code: "zh-tw",
        title: "",
        summary: "",
        seo_title: "",
        seo_description: "",
        content: {}
      }
    ]
  };
}

function translationFor(guide: CityGuideRecord, language: CityGuideTranslationRecord["language_code"]) {
  return guide.translations.find((item) => item.language_code === language) ?? {
    language_code: language,
    title: "",
    summary: "",
    seo_title: "",
    seo_description: "",
    content: {}
  };
}

export function AdminCityGuideManager({ initialGuides }: { initialGuides: CityGuideRecord[] }) {
  const [guides, setGuides] = useState<CityGuideRecord[]>(initialGuides);
  const [selectedSlug, setSelectedSlug] = useState(initialGuides[0]?.slug ?? "");
  const [language, setLanguage] = useState<CityGuideTranslationRecord["language_code"]>("zh-tw");
  const [status, setStatus] = useState("城市攻略會直接讀寫 city_guides 與 city_guide_translations 資料表。");
  const selectedGuide = useMemo(() => guides.find((guide) => guide.slug === selectedSlug) ?? guides[0], [guides, selectedSlug]);
  const selectedTranslation = selectedGuide ? translationFor(selectedGuide, language) : null;

  function replaceGuide(guide: CityGuideRecord) {
    setGuides((current) => {
      const exists = current.some((item) => item.slug === guide.slug || item.id === guide.id);
      const next = exists ? current.map((item) => item.slug === selectedSlug || item.id === guide.id ? guide : item) : [...current, guide];
      return next.sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order || a.city.localeCompare(b.city));
    });
    setSelectedSlug(guide.slug);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedGuide) return;
    const formData = new FormData(event.currentTarget);
    const nextTranslation: CityGuideTranslationRecord = {
      ...selectedTranslation,
      language_code: language,
      title: value(formData, "translation_title"),
      summary: value(formData, "translation_summary"),
      seo_title: value(formData, "seo_title"),
      seo_description: value(formData, "seo_description"),
      content: {
        foodThemes: splitList(value(formData, "localized_food_themes")),
        districts: splitList(value(formData, "localized_districts")),
        suggestedPlan: splitList(value(formData, "localized_suggested_plan")),
        seoKeywords: splitList(value(formData, "localized_seo_keywords")),
        body: value(formData, "localized_body")
      }
    };
    const nextTranslations = [
      ...selectedGuide.translations.filter((item) => item.language_code !== language),
      nextTranslation
    ];
    const record = normalizeCityGuideRecord({
      ...selectedGuide,
      city: value(formData, "city"),
      slug: value(formData, "slug"),
      destination_slug: value(formData, "destination_slug"),
      region: value(formData, "region"),
      latitude: value(formData, "latitude"),
      longitude: value(formData, "longitude"),
      cover_image_url: value(formData, "cover_image_url"),
      food_themes: value(formData, "food_themes"),
      districts: value(formData, "districts"),
      suggested_plan: value(formData, "suggested_plan"),
      seo_keywords: value(formData, "seo_keywords"),
      status: value(formData, "status"),
      is_featured: formData.get("is_featured") === "on",
      sort_order: value(formData, "sort_order"),
      translations: nextTranslations
    });
    if (!record) {
      setStatus("請至少填寫城市名稱與 slug。");
      return;
    }

    replaceGuide(record);
    setStatus("正在同步資料庫...");
    const method = isUuid(selectedGuide.id) ? "PATCH" : "POST";
    const endpoint = method === "PATCH" ? `/api/city-guides/${encodeURIComponent(selectedGuide.slug)}` : "/api/city-guides";
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record)
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "同步資料庫失敗");
      const saved = normalizeCityGuideRecord(body.guide);
      if (saved) replaceGuide(saved);
      setStatus("城市攻略已同步到資料庫。");
    } catch (error) {
      setStatus(`目前只更新畫面；資料庫同步失敗：${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  async function deleteSelected() {
    if (!selectedGuide) return;
    setGuides((current) => current.filter((guide) => guide.slug !== selectedGuide.slug));
    setSelectedSlug(guides.find((guide) => guide.slug !== selectedGuide.slug)?.slug ?? "");
    if (!isUuid(selectedGuide.id)) {
      setStatus("已從目前畫面移除；此筆尚未存在資料庫。");
      return;
    }
    try {
      const response = await fetch(`/api/city-guides/${encodeURIComponent(selectedGuide.slug)}`, { method: "DELETE" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "刪除失敗");
      setStatus("城市攻略已從資料庫刪除。");
    } catch (error) {
      setStatus(`刪除資料庫失敗：${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  function createGuide() {
    const guide = blankGuide();
    setGuides((current) => [...current, guide]);
    setSelectedSlug(guide.slug);
    setLanguage("zh-tw");
    setStatus("已建立新的草稿，填寫後儲存即可新增到資料庫。");
  }

  if (!selectedGuide || !selectedTranslation) {
    return (
      <div className="mt-6 rounded-lg border border-dashed bg-card p-6">
        <p className="text-sm text-muted-foreground">目前沒有城市攻略資料。</p>
        <Button type="button" className="mt-4" onClick={createGuide}>
          <Plus className="h-4 w-4" />
          新增城市攻略
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-6">
      <section className="rounded-lg border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">城市攻略 CRUD</h2>
            <p className="mt-1 text-sm text-muted-foreground">管理核心城市資料與各語系標題、摘要、SEO、內容欄位。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={createGuide}>
              <Plus className="h-4 w-4" />
              新增
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/city-guides" target="_blank">
                <Eye className="h-4 w-4" />
                查看前台
              </Link>
            </Button>
          </div>
        </div>

        <form key={`${selectedGuide.slug}-${language}`} onSubmit={handleSubmit} className="mt-5 grid gap-5">
          <div className="grid gap-3 md:grid-cols-[1fr_160px_160px]">
            <label className="grid gap-1.5 text-sm font-medium">
              選擇城市
              <select value={selectedSlug} onChange={(event) => setSelectedSlug(event.target.value)} className={selectClass}>
                {guides.map((guide) => <option key={`${guide.id}-${guide.slug}`} value={guide.slug}>{guide.city || guide.slug}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              狀態
              <select name="status" defaultValue={selectedGuide.status} className={selectClass}>
                <option value="published">published</option>
                <option value="draft">draft</option>
                <option value="archived">archived</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              排序
              <Input name="sort_order" type="number" defaultValue={selectedGuide.sort_order} />
            </label>
          </div>

          <div className="rounded-lg border bg-background p-4">
            <h3 className="font-semibold">核心資料</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Input name="city" defaultValue={selectedGuide.city} placeholder="城市名稱，例如 Ho Chi Minh City" />
              <Input name="slug" defaultValue={selectedGuide.slug} placeholder="slug，例如 ho-chi-minh" />
              <Input name="destination_slug" defaultValue={selectedGuide.destination_slug} placeholder="對應目的地 slug / id" />
              <select name="region" defaultValue={selectedGuide.region} className={selectClass}>
                <option value="north">north</option>
                <option value="central">central</option>
                <option value="south">south</option>
              </select>
              <Input name="latitude" type="number" step="0.000001" defaultValue={selectedGuide.latitude} placeholder="緯度" />
              <Input name="longitude" type="number" step="0.000001" defaultValue={selectedGuide.longitude} placeholder="經度" />
            </div>
            <Input name="cover_image_url" defaultValue={selectedGuide.cover_image_url} placeholder="封面圖片 URL" className="mt-3" />
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Input name="food_themes" defaultValue={listText(selectedGuide.food_themes)} placeholder="必吃主題，逗號分隔" />
              <Input name="districts" defaultValue={listText(selectedGuide.districts)} placeholder="熱門區域，逗號分隔" />
              <Input name="suggested_plan" defaultValue={listText(selectedGuide.suggested_plan)} placeholder="建議路線，逗號分隔" />
              <Input name="seo_keywords" defaultValue={listText(selectedGuide.seo_keywords)} placeholder="SEO 關鍵字，逗號分隔" />
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input name="is_featured" type="checkbox" defaultChecked={selectedGuide.is_featured} className="h-4 w-4 rounded border" />
              精選城市攻略
            </label>
          </div>

          <div className="rounded-lg border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-semibold">
                <Languages className="h-4 w-4 text-primary" />
                多語系內容
              </h3>
              <select value={language} onChange={(event) => setLanguage(event.target.value as CityGuideTranslationRecord["language_code"])} className={selectClass}>
                {languageOptions.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
              </select>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Input name="translation_title" defaultValue={selectedTranslation.title} placeholder="語系標題" />
              <Input name="seo_title" defaultValue={selectedTranslation.seo_title} placeholder="SEO Title" />
            </div>
            <Textarea name="translation_summary" defaultValue={selectedTranslation.summary} rows={3} placeholder="語系摘要" className="mt-3" />
            <Textarea name="seo_description" defaultValue={selectedTranslation.seo_description} rows={2} placeholder="Meta Description" className="mt-3" />
            <Textarea name="localized_body" defaultValue={selectedTranslation.content.body} rows={4} placeholder="城市攻略內文" className="mt-3" />
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Input name="localized_food_themes" defaultValue={listText(selectedTranslation.content.foodThemes)} placeholder="語系必吃主題，逗號分隔" />
              <Input name="localized_districts" defaultValue={listText(selectedTranslation.content.districts)} placeholder="語系熱門區域，逗號分隔" />
              <Input name="localized_suggested_plan" defaultValue={listText(selectedTranslation.content.suggestedPlan)} placeholder="語系建議路線，逗號分隔" />
              <Input name="localized_seo_keywords" defaultValue={listText(selectedTranslation.content.seoKeywords)} placeholder="語系 SEO 關鍵字，逗號分隔" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-sm text-muted-foreground">{status}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="destructive" onClick={deleteSelected}>
                <Trash2 className="h-4 w-4" />
                刪除
              </Button>
              <Button>
                <Save className="h-4 w-4" />
                儲存
              </Button>
            </div>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 font-medium">city</th>
              <th className="px-4 py-3 font-medium">slug</th>
              <th className="px-4 py-3 font-medium">status</th>
              <th className="px-4 py-3 font-medium">languages</th>
              <th className="px-4 py-3 font-medium">sort</th>
            </tr>
          </thead>
          <tbody>
            {guides.map((guide) => (
              <tr key={`${guide.id}-${guide.slug}`} className="border-t">
                <td className="px-4 py-3 font-medium">{guide.city}</td>
                <td className="px-4 py-3">{guide.slug}</td>
                <td className="px-4 py-3">{guide.status}</td>
                <td className="px-4 py-3">{guide.translations.map((item) => item.language_code).join(", ") || "-"}</td>
                <td className="px-4 py-3">{guide.sort_order}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
