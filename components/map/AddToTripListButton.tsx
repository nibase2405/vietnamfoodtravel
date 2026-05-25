"use client";

import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { type SupportedLocale } from "@/lib/i18n/config";
import { useCurrentLocale } from "@/lib/i18n/use-current-locale";

type TripList = { id: string; title: string };
const labels: Record<SupportedLocale, { loginFirst: string; addFailed: string; added: string; add: string; addToTrip: string }> = {
  "zh-tw": { loginFirst: "請先登入並建立行程清單", addFailed: "無法加入行程清單", added: "已加入行程清單", add: "加入", addToTrip: "加入行程" },
  "zh-cn": { loginFirst: "请先登录并建立行程清单", addFailed: "无法加入行程清单", added: "已加入行程清单", add: "加入", addToTrip: "加入行程" },
  en: { loginFirst: "Please log in and create a trip list first", addFailed: "Could not add to trip list", added: "Added to trip list", add: "Add", addToTrip: "Add to trip" },
  vi: { loginFirst: "Vui lòng đăng nhập và tạo danh sách trước", addFailed: "Không thể thêm vào lịch trình", added: "Đã thêm vào lịch trình", add: "Thêm", addToTrip: "Thêm vào lịch trình" },
  ko: { loginFirst: "먼저 로그인하고 일정 목록을 만들어 주세요", addFailed: "일정 목록에 추가할 수 없습니다", added: "일정 목록에 추가되었습니다", add: "추가", addToTrip: "일정에 추가" },
  ja: { loginFirst: "先にログインして旅程リストを作成してください", addFailed: "旅程リストに追加できません", added: "旅程リストに追加しました", add: "追加", addToTrip: "旅程に追加" }
};

let tripListsCache: TripList[] | null = null;
let tripListsRequest: Promise<TripList[]> | null = null;

async function getTripLists() {
  if (tripListsCache) return tripListsCache;
  tripListsRequest ??= fetch("/api/me/trip-lists")
    .then((response) => (response.ok ? response.json() : []))
    .then((data) => {
      tripListsCache = Array.isArray(data) ? data : [];
      return tripListsCache;
    })
    .catch(() => {
      tripListsCache = [];
      return [];
    });
  return tripListsRequest;
}

export function AddToTripListButton({
  entityType,
  entityId,
  title,
  latitude,
  longitude,
  className
}: {
  entityType: string;
  entityId: string;
  title?: string;
  latitude?: number | null;
  longitude?: number | null;
  className?: string;
}) {
  const locale = useCurrentLocale();
  const text = labels[locale];
  const [isPending, startTransition] = useTransition();
  const [lists, setLists] = useState<TripList[]>([]);
  const [selected, setSelected] = useState("");
  const [loaded, setLoaded] = useState(false);

  function loadLists() {
    startTransition(() => {
      void getTripLists().then((data) => {
        setLists(data);
        setLoaded(true);
        if (data[0]?.id) setSelected(data[0].id);
        if (!data.length) window.alert(text.loginFirst);
      });
    });
  }

  function addSelected() {
    if (!selected) return;
    startTransition(() => {
      void (async () => {
        const response = await fetch(`/api/trip-lists/${selected}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entity_type: entityType, entity_id: entityId, custom_title: title, latitude, longitude })
        });
        if (!response.ok) throw new Error(text.addFailed);
        window.alert(text.added);
      })().catch((error) => window.alert(error.message));
    });
  }

  return (
    <div className={className}>
      {loaded && lists.length ? (
        <div className="flex gap-2">
          <select className="h-10 rounded-md border bg-white px-2 text-sm" value={selected} onChange={(event) => setSelected(event.target.value)}>
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.title}
              </option>
            ))}
          </select>
          <Button type="button" variant="outline" disabled={isPending || !selected} onClick={addSelected}>
            <Plus className="h-4 w-4" />
            {text.add}
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" disabled={isPending} onClick={loadLists}>
          <Plus className="h-4 w-4" />
          {text.addToTrip}
        </Button>
      )}
    </div>
  );
}
