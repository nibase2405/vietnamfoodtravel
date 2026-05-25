"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Plus, RotateCcw, Save, SlidersHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  defaultRestaurantFilterSettings,
  normalizeRestaurantFilterSettings,
  paramsToQuery,
  queryToParams,
  RESTAURANT_FILTER_SETTINGS_STORAGE_KEY,
  restaurantFilterGroupKeys,
  restaurantFilterGroupLabels,
  type RestaurantFilterGroupKey,
  type RestaurantFilterOption,
  type RestaurantFilterSettings,
  type RestaurantFilterSettingsResponse
} from "@/lib/restaurant-filter-settings";

type EditorQuickFilter = {
  id: string;
  label: string;
  query: string;
};

type EditorOption = RestaurantFilterOption & {
  id: string;
};

type EditorGroups = Record<RestaurantFilterGroupKey, EditorOption[]>;

function createRowId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function toQuickRows(settings: RestaurantFilterSettings): EditorQuickFilter[] {
  return settings.quickFilters.map((filter) => ({
    id: createRowId(),
    label: filter.label,
    query: paramsToQuery(filter.params)
  }));
}

function toGroupRows(settings: RestaurantFilterSettings): EditorGroups {
  return Object.fromEntries(
    restaurantFilterGroupKeys.map((key) => [
      key,
      settings.groups[key].map((option) => ({ ...option, id: createRowId() }))
    ])
  ) as EditorGroups;
}

function toSettings(quickFilters: EditorQuickFilter[], groups: EditorGroups) {
  return normalizeRestaurantFilterSettings({
    quickFilters: quickFilters.map((filter) => ({
      label: filter.label.trim(),
      params: queryToParams(filter.query)
    })),
    groups: Object.fromEntries(
      restaurantFilterGroupKeys.map((key) => [
        key,
        groups[key].map((option) => ({
          label: option.label.trim(),
          value: option.value.trim()
        }))
      ])
    )
  });
}

function getSettingsSource(data: unknown) {
  return data && typeof data === "object" && "source" in data
    ? (data as RestaurantFilterSettingsResponse).source
    : undefined;
}

export function AdminRestaurantFilterSettings() {
  const [quickFilters, setQuickFilters] = useState<EditorQuickFilter[]>(() => toQuickRows(defaultRestaurantFilterSettings));
  const [groups, setGroups] = useState<EditorGroups>(() => toGroupRows(defaultRestaurantFilterSettings));
  const [status, setStatus] = useState("正在載入篩選設定...");
  const [isPending, startTransition] = useTransition();

  const applySettings = useCallback((settings: RestaurantFilterSettings) => {
    setQuickFilters(toQuickRows(settings));
    setGroups(toGroupRows(settings));
  }, []);

  useEffect(() => {
    let hasLocalSettings = false;

    try {
      const saved = window.localStorage.getItem(RESTAURANT_FILTER_SETTINGS_STORAGE_KEY);
      if (saved) {
        hasLocalSettings = true;
        applySettings(normalizeRestaurantFilterSettings(JSON.parse(saved)));
        setStatus("已載入本機預覽設定，儲存後會嘗試同步資料庫。");
      }
    } catch {
      setStatus("本機篩選設定讀取失敗，已使用預設值。");
    }

    void fetch("/api/restaurant-filter-settings", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!data) {
          if (!hasLocalSettings) setStatus("無法讀取資料庫設定，已使用預設篩選。");
          return;
        }

        const source = getSettingsSource(data);
        if (source === "database" || !hasLocalSettings) {
          const normalized = normalizeRestaurantFilterSettings(data);
          applySettings(normalized);
          window.localStorage.setItem(RESTAURANT_FILTER_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
          setStatus(source === "database" ? "已載入資料庫中的篩選設定。" : "資料庫尚未設定，已載入預設篩選。");
          return;
        }

        setStatus("目前使用本機預覽設定；資料庫尚未有餐廳篩選設定。");
      })
      .catch(() => {
        if (!hasLocalSettings) setStatus("無法讀取資料庫設定，已使用預設篩選。");
      });
  }, [applySettings]);

  function updateQuickFilter(id: string, patch: Partial<EditorQuickFilter>) {
    setQuickFilters((current) => current.map((filter) => filter.id === id ? { ...filter, ...patch } : filter));
  }

  function updateGroupOption(groupKey: RestaurantFilterGroupKey, id: string, patch: Partial<RestaurantFilterOption>) {
    setGroups((current) => ({
      ...current,
      [groupKey]: current[groupKey].map((option) => option.id === id ? { ...option, ...patch } : option)
    }));
  }

  function saveSettings() {
    const normalized = toSettings(quickFilters, groups);
    window.localStorage.setItem(RESTAURANT_FILTER_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
    setStatus("已儲存到本機預覽，美食地圖會立即套用。正在同步資料庫...");

    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/restaurant-filter-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(normalized)
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "資料庫同步失敗");

        const synced = normalizeRestaurantFilterSettings(body);
        applySettings(synced);
        window.localStorage.setItem(RESTAURANT_FILTER_SETTINGS_STORAGE_KEY, JSON.stringify(synced));
        setStatus("篩選設定已同步到資料庫。");
      })().catch((error) => setStatus(`已儲存到本機預覽；資料庫未同步（${error.message}）。`));
    });
  }

  function resetDefaults() {
    applySettings(defaultRestaurantFilterSettings);
    setStatus("已還原預設篩選，按下儲存後才會套用到資料庫。");
  }

  return (
    <section className="mt-6 grid gap-5 rounded-lg border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <SlidersHorizontal className="h-4 w-4" />
            餐廳篩選設定
          </div>
          <h2 className="mt-1 text-lg font-semibold">美食地圖下拉選單與快速篩選</h2>
          <p className="mt-1 text-sm text-muted-foreground">管理員可調整前台餐廳篩選選項、查詢值與使用者常點快速篩選。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={resetDefaults} disabled={isPending}>
            <RotateCcw className="h-4 w-4" />
            還原預設
          </Button>
          <Button type="button" size="sm" onClick={saveSettings} disabled={isPending}>
            <Save className="h-4 w-4" />
            儲存篩選
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">{status}</div>

      <div className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-medium">使用者常點快速篩選</h3>
            <p className="text-sm text-muted-foreground">
              查詢值可輸入 <code>open=true</code> 或 <code>city=Hanoi&amp;cuisine=Seafood</code>。
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setQuickFilters((current) => [...current, { id: createRowId(), label: "", query: "" }])}
          >
            <Plus className="h-4 w-4" />
            新增快速篩選
          </Button>
        </div>

        <div className="grid gap-2">
          {quickFilters.map((filter) => (
            <div key={filter.id} className="grid gap-2 md:grid-cols-[220px_1fr_auto]">
              <Input
                value={filter.label}
                onChange={(event) => updateQuickFilter(filter.id, { label: event.target.value })}
                placeholder="顯示名稱，例如 現在營業中"
                aria-label="快速篩選顯示名稱"
              />
              <Input
                value={filter.query}
                onChange={(event) => updateQuickFilter(filter.id, { query: event.target.value })}
                placeholder="查詢值，例如 open=true"
                aria-label="快速篩選查詢值"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setQuickFilters((current) => current.filter((item) => item.id !== filter.id))}
                aria-label="刪除快速篩選"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {restaurantFilterGroupKeys.map((groupKey) => (
          <div key={groupKey} className="grid gap-3 rounded-lg border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-medium">{restaurantFilterGroupLabels[groupKey]}</h3>
                <p className="text-sm text-muted-foreground">顯示名稱給使用者看；查詢值需對應餐廳資料欄位。</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGroups((current) => ({
                  ...current,
                  [groupKey]: [...current[groupKey], { id: createRowId(), label: "", value: "" }]
                }))}
              >
                <Plus className="h-4 w-4" />
                新增選項
              </Button>
            </div>

            <div className="grid gap-2">
              {groups[groupKey].map((option) => (
                <div key={option.id} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                  <Input
                    value={option.label}
                    onChange={(event) => updateGroupOption(groupKey, option.id, { label: event.target.value })}
                    placeholder="顯示名稱"
                    aria-label={`${restaurantFilterGroupLabels[groupKey]}顯示名稱`}
                  />
                  <Input
                    value={option.value}
                    onChange={(event) => updateGroupOption(groupKey, option.id, { value: event.target.value })}
                    placeholder="查詢值，全部選項可留空"
                    aria-label={`${restaurantFilterGroupLabels[groupKey]}查詢值`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setGroups((current) => ({
                      ...current,
                      [groupKey]: current[groupKey].filter((item) => item.id !== option.id)
                    }))}
                    aria-label={`刪除${restaurantFilterGroupLabels[groupKey]}選項`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
