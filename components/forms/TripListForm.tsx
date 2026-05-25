"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TripListForm() {
  const [isPending, startTransition] = useTransition();
  return (
    <form
      className="grid gap-3 rounded-lg border bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget));
        startTransition(() => {
          void (async () => {
            const response = await fetch("/api/trip-lists", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error("Failed to create trip list");
            window.alert("Trip list created");
            event.currentTarget.reset();
          })().catch((error) => window.alert(error.message));
        });
      }}
    >
      <Input name="title" placeholder="Trip list title" />
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="start_date" type="date" />
        <Input name="end_date" type="date" />
      </div>
      <Input name="visibility" defaultValue="private" placeholder="private / public" />
      <Button disabled={isPending}>Create trip list</Button>
    </form>
  );
}
