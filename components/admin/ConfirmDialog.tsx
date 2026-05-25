"use client";

import { Button } from "@/components/ui/button";

export function ConfirmDialog({ label = "確認", onConfirm }: { label?: string; onConfirm?: () => void }) {
  return <Button variant="destructive" size="sm" onClick={() => window.confirm("確認執行？") && onConfirm?.()}>{label}</Button>;
}
