"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function GuideAvailabilityForm({ guideId }: { guideId?: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-3 rounded-lg border bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget));
        startTransition(() => {
          void (async () => {
            const response = await fetch("/api/guide-availability", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...data, guide_id: guideId ?? data.guide_id, is_available: true })
            });
            if (!response.ok) throw new Error("Failed to save availability");
            window.alert("Availability saved");
            event.currentTarget.reset();
          })().catch((error) => window.alert(error.message));
        });
      }}
    >
      {!guideId ? <Input name="guide_id" placeholder="Guide ID" /> : null}
      <Input name="available_date" type="date" />
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="start_time" type="time" />
        <Input name="end_time" type="time" />
      </div>
      <Button disabled={isPending}>Add availability</Button>
    </form>
  );
}
