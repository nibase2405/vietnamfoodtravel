"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Eye, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { applyRankingSettings, normalizeRankingSetting, type RankingConfig } from "@/lib/ranking-settings";
import type { RankingGroup } from "@/lib/rankings";

const selectClass = "h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function blankConfig(group?: RankingGroup, index = 0): RankingConfig {
  const time = Date.now();
  return {
    id: group ? `${group.id}-${time}` : `custom-ranking-${time}`,
    ranking_key: group?.id ?? "most-booked",
    title: group?.title ?? "新的排行榜類型",
    description: group?.description ?? "",
    city: "",
    category: group?.category ?? "",
    language_code: "",
    sponsored_mode: "include",
    status: "published",
    sort_order: index,
    rule: {}
  };
}

function defaultConfigs(groups: RankingGroup[]): RankingConfig[] {
  return groups.map((group, index) => ({
    id: group.id,
    ranking_key: group.id,
    title: group.title,
    description: group.description,
    city: "",
    category: group.category ?? "",
    language_code: "",
    sponsored_mode: "include",
    status: "published",
    sort_order: index,
    rule: {}
  }));
}

export function AdminRankingManager({ initialGroups, initialConfigs = [] }: { initialGroups: RankingGroup[]; initialConfigs?: RankingConfig[] }) {
  const persistedInitialIds = useMemo(() => new Set(initialConfigs.map((config) => config.id)), [initialConfigs]);
  const [persistedIds, setPersistedIds] = useState<Set<string>>(persistedInitialIds);
  const [configs, setConfigs] = useState<RankingConfig[]>(initialConfigs.length ? initialConfigs : defaultConfigs(initialGroups));
  const [selectedId, setSelectedId] = useState((initialConfigs.length ? initialConfigs[0]?.id : initialGroups[0]?.id) ?? "");
  const [status, setStatus] = useState("可在此管理前台顯示的排行榜類型。未儲存的預設類型需按下儲存才會寫入資料庫。");
  const selectedConfig = useMemo(() => configs.find((config) => config.id === selectedId) ?? configs[0], [configs, selectedId]);
  const previewGroups = useMemo(() => applyRankingSettings(initialGroups, configs, { locale: "zh-tw" }), [initialGroups, configs]);
  const baseGroup = useMemo(() => initialGroups.find((group) => group.id === selectedConfig?.ranking_key), [initialGroups, selectedConfig?.ranking_key]);

  function replaceConfig(config: RankingConfig) {
    setConfigs((current) => {
      const exists = current.some((item) => item.id === config.id);
      const next = exists ? current.map((item) => item.id === config.id ? config : item) : [...current, config];
      return next.sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id));
    });
    setSelectedId(config.id);
  }

  function createConfig() {
    const config = blankConfig(initialGroups[0], configs.length);
    setConfigs((current) => [...current, config]);
    setSelectedId(config.id);
    setStatus("已新增排行榜類型草稿，請編輯內容後儲存。");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedConfig) return;

    const formData = new FormData(event.currentTarget);
    const normalized = normalizeRankingSetting({
      id: value(formData, "id"),
      ranking_key: value(formData, "ranking_key"),
      title: value(formData, "title"),
      description: value(formData, "description"),
      city: value(formData, "city"),
      category: value(formData, "category"),
      language_code: value(formData, "language_code"),
      sponsored_mode: value(formData, "sponsored_mode"),
      status: value(formData, "status"),
      sort_order: value(formData, "sort_order"),
      rule: { note: value(formData, "rule_note") }
    });
    if (!normalized) {
      setStatus("請輸入排行榜類型 ID。");
      return;
    }

    const wasPersisted = persistedIds.has(selectedConfig.id);
    const config: RankingConfig = wasPersisted ? { ...normalized, id: selectedConfig.id } : normalized;
    replaceConfig(config);
    setStatus("正在儲存排行榜類型...");

    try {
      const response = await fetch(wasPersisted ? `/api/ranking-configs/${encodeURIComponent(selectedConfig.id)}` : "/api/ranking-configs", {
        method: wasPersisted ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "儲存失敗");
      const saved = normalizeRankingSetting(body.config);
      if (saved) {
        replaceConfig(saved);
        setPersistedIds((current) => new Set(current).add(saved.id));
      }
      setStatus("排行榜類型已儲存，前台排行榜會依此設定顯示。");
    } catch (error) {
      setStatus(`儲存失敗：${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  async function deleteSelected() {
    if (!selectedConfig) return;
    const deleteId = selectedConfig.id;
    setConfigs((current) => current.filter((config) => config.id !== deleteId));
    setSelectedId(configs.find((config) => config.id !== deleteId)?.id ?? "");

    if (!persistedIds.has(deleteId)) {
      setStatus("已移除尚未儲存的排行榜類型。");
      return;
    }

    try {
      const response = await fetch(`/api/ranking-configs/${encodeURIComponent(deleteId)}`, { method: "DELETE" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "刪除失敗");
      setPersistedIds((current) => {
        const next = new Set(current);
        next.delete(deleteId);
        return next;
      });
      setStatus("排行榜類型已從資料庫移除。");
    } catch (error) {
      setStatus(`刪除失敗：${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  if (!selectedConfig) {
    return (
      <div className="mt-6 rounded-lg border border-dashed bg-card p-6">
        <p className="text-sm text-muted-foreground">目前沒有排行榜類型。</p>
        <Button type="button" className="mt-4" onClick={createConfig}>
          <Plus className="h-4 w-4" />
          新增排行榜類型
        </Button>
      </div>
    );
  }

  const isSelectedPersisted = persistedIds.has(selectedConfig.id);

  return (
    <div className="mt-6 grid gap-6">
      <section className="rounded-lg border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">排行榜類型 CRUD</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              每一筆設定就是前台會顯示的一個排行榜類型。可用狀態控制顯示，或直接移除。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={createConfig}>
              <Plus className="h-4 w-4" />
              新增類型
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/rankings" target="_blank">
                <Eye className="h-4 w-4" />
                查看前台
              </Link>
            </Button>
          </div>
        </div>

        <form key={selectedConfig.id} onSubmit={handleSubmit} className="mt-5 grid gap-4">
          <div className="grid gap-3 md:grid-cols-[1fr_160px_160px]">
            <label className="grid gap-1.5 text-sm font-medium">
              選擇排行榜類型
              <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className={selectClass}>
                {configs.map((config) => <option key={config.id} value={config.id}>{config.title || config.id}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              顯示狀態
              <select name="status" defaultValue={selectedConfig.status} className={selectClass}>
                <option value="published">顯示 published</option>
                <option value="draft">草稿 draft</option>
                <option value="archived">隱藏 archived</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              排序
              <Input name="sort_order" type="number" defaultValue={selectedConfig.sort_order} />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              類型 ID
              <Input name="id" defaultValue={selectedConfig.id} readOnly={isSelectedPersisted} placeholder="例如 hcm-most-booked" />
              {isSelectedPersisted ? <span className="text-xs font-normal text-muted-foreground">已儲存類型的 ID 不可修改，請新增類型建立新 ID。</span> : null}
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              榜單來源
              <select name="ranking_key" defaultValue={selectedConfig.ranking_key} className={selectClass}>
                {initialGroups.map((group) => <option key={group.id} value={group.id}>{group.title} ({group.id})</option>)}
              </select>
            </label>
          </div>

          <Input name="title" defaultValue={selectedConfig.title} placeholder="前台顯示標題，例如 胡志明市預訂最多" />
          <Textarea name="description" defaultValue={selectedConfig.description} rows={3} placeholder="前台顯示說明" />

          <div className="grid gap-3 md:grid-cols-4">
            <label className="grid gap-1.5 text-sm font-medium">
              城市篩選
              <Input name="city" defaultValue={selectedConfig.city} placeholder="例如 Ho Chi Minh City，可留空" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              菜系 / 分類篩選
              <Input name="category" defaultValue={selectedConfig.category} placeholder="例如 海鮮、越南料理，可留空" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              語系
              <select name="language_code" defaultValue={selectedConfig.language_code} className={selectClass}>
                <option value="">所有語系</option>
                <option value="zh-tw">繁體中文</option>
                <option value="zh-cn">簡體中文</option>
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
                <option value="ko">한국어</option>
                <option value="ja">日本語</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Sponsored 規則
              <select name="sponsored_mode" defaultValue={selectedConfig.sponsored_mode} className={selectClass}>
                <option value="include">包含 Sponsored</option>
                <option value="only">只顯示 Sponsored</option>
                <option value="exclude">排除 Sponsored</option>
              </select>
            </label>
          </div>

          <Textarea name="rule_note" defaultValue={String(selectedConfig.rule?.note ?? "")} rows={2} placeholder="內部備註，例如 本週主推第 1 郡海鮮榜" />

          <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
            <div className="font-medium text-foreground">預覽</div>
            <div className="mt-1">來源榜單：{baseGroup?.title ?? selectedConfig.ranking_key}</div>
            <div>目前符合設定的餐廳數：{previewGroups.find((group) => group.id === selectedConfig.id)?.restaurants.length ?? 0}</div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-sm text-muted-foreground">{status}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="destructive" onClick={deleteSelected}>
                <Trash2 className="h-4 w-4" />
                移除類型
              </Button>
              <Button>
                <Save className="h-4 w-4" />
                儲存類型
              </Button>
            </div>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border bg-card">
        <div className="border-b p-4">
          <h2 className="font-semibold">目前設定的排行榜類型</h2>
          <p className="mt-1 text-sm text-muted-foreground">前台會依排序與狀態顯示這些類型。移除後該類型不會出現在前台。</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium">標題</th>
                <th className="px-4 py-3 font-medium">來源</th>
                <th className="px-4 py-3 font-medium">狀態</th>
                <th className="px-4 py-3 font-medium">城市</th>
                <th className="px-4 py-3 font-medium">分類</th>
                <th className="px-4 py-3 font-medium">語系</th>
                <th className="px-4 py-3 font-medium">Sponsored</th>
                <th className="px-4 py-3 font-medium">預覽</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((config) => {
                const preview = previewGroups.find((group) => group.id === config.id);
                return (
                  <tr key={config.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{config.title || config.id}</td>
                    <td className="px-4 py-3">{config.ranking_key}</td>
                    <td className="px-4 py-3">{config.status}</td>
                    <td className="px-4 py-3">{config.city || "全部"}</td>
                    <td className="px-4 py-3">{config.category || "全部"}</td>
                    <td className="px-4 py-3">{config.language_code || "全部"}</td>
                    <td className="px-4 py-3">{config.sponsored_mode}</td>
                    <td className="px-4 py-3">{preview?.restaurants.length ?? 0} 間</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
