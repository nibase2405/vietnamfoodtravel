"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ReviewForm({ entityType, entityId }: { entityType: "tour" | "guide" | "restaurant" | "attraction"; entityId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <form
      className="grid gap-3 rounded-lg border bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget));
        startTransition(() => {
          void (async () => {
            const response = await fetch("/api/reviews", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...data, entity_type: entityType, entity_id: entityId, rating: Number(data.rating) })
            });
            if (!response.ok) throw new Error("評論送出失敗");
            window.alert("評論已送出，等待審核。");
            event.currentTarget.reset();
          })().catch((error) => window.alert(error.message));
        });
      }}
    >
      <Input name="rating" type="number" min={1} max={5} placeholder="評分 1-5" />
      <Input name="title" placeholder="評論標題" />
      <Textarea name="content" placeholder="分享餐點、價格、服務或環境感受" />
      <Button disabled={isPending}>送出評論</Button>
    </form>
  );
}
