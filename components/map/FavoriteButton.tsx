"use client";

import { useEffect, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type SupportedLocale } from "@/lib/i18n/config";
import { useCurrentLocale } from "@/lib/i18n/use-current-locale";
import { cn } from "@/lib/utils/cn";

const STORAGE_KEY = "vietfood:favorites:v1";
const labels: Record<SupportedLocale, { add: string; remove: string; added: string }> = {
  "zh-tw": { add: "收藏", remove: "取消收藏", added: "已收藏" },
  "zh-cn": { add: "收藏", remove: "取消收藏", added: "已收藏" },
  en: { add: "Save", remove: "Remove from saved", added: "Saved" },
  vi: { add: "Lưu", remove: "Bỏ lưu", added: "Đã lưu" },
  ko: { add: "저장", remove: "저장 취소", added: "저장됨" },
  ja: { add: "保存", remove: "保存を解除", added: "保存済み" }
};

function favoriteKey(entityType: string, entityId: string) {
  return `${entityType}:${entityId}`;
}

function readLocalFavorites() {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set<string>();
  }
}

function writeLocalFavorite(key: string, favorited: boolean) {
  if (typeof window === "undefined") return;
  const favorites = readLocalFavorites();
  if (favorited) favorites.add(key);
  else favorites.delete(key);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
}

export function FavoriteButton({ entityType, entityId, className }: { entityType: string; entityId: string; className?: string }) {
  const locale = useCurrentLocale();
  const text = labels[locale];
  const key = favoriteKey(entityType, entityId);
  const [favorited, setFavorited] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setFavorited(readLocalFavorites().has(key));
  }, [key]);

  function toggle() {
    const nextValue = !favorited;
    setFavorited(nextValue);
    writeLocalFavorite(key, nextValue);

    startTransition(async () => {
      try {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entity_type: entityType, entity_id: entityId, favorited: nextValue })
        });

        if (response.ok) {
          const payload = await response.json();
          if (typeof payload.favorited === "boolean") {
            setFavorited(payload.favorited);
            writeLocalFavorite(key, payload.favorited);
          }
        }
      } catch {
        setFavorited(nextValue);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      className={cn("rounded-full bg-card/95 shadow-sm hover:bg-card", favorited && "bg-accent/10 text-accent hover:bg-accent/10", className)}
      onClick={toggle}
      aria-label={favorited ? text.remove : text.add}
      aria-pressed={favorited}
      title={favorited ? text.remove : text.add}
      disabled={isPending}
    >
      <Heart className={cn("h-4 w-4", favorited && "fill-current")} />
      <span className="sr-only">{favorited ? text.added : text.add}</span>
    </Button>
  );
}
