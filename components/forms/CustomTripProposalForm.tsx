"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Day = { day: string; title: string; description: string };

export function CustomTripProposalForm({ requestId }: { requestId?: string }) {
  const [isPending, startTransition] = useTransition();
  const [days, setDays] = useState<Day[]>([{ day: "1", title: "", description: "" }]);
  const itinerary = useMemo(() => ({ days: days.map((day) => ({ ...day, day: Number(day.day) })) }), [days]);

  return (
    <form
      className="grid gap-4 rounded-lg border bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const payload = {
          request_id: requestId ?? String(form.get("request_id") ?? ""),
          title: form.get("title"),
          quoted_price: Number(form.get("quoted_price") ?? 0),
          currency: form.get("currency") ?? "USD",
          pdf_url: form.get("pdf_url"),
          itinerary
        };
        startTransition(() => {
          void (async () => {
            const response = await fetch("/api/custom-trip-proposals", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error("Failed to create proposal");
            window.alert("Proposal created");
            event.currentTarget.reset();
          })().catch((error) => window.alert(error.message));
        });
      }}
    >
      {!requestId ? <Input name="request_id" placeholder="Custom trip request ID" /> : null}
      <Input name="title" placeholder="Proposal title" />
      <div className="grid gap-3 md:grid-cols-3">
        <Input name="quoted_price" type="number" placeholder="Quoted price" />
        <Input name="currency" defaultValue="USD" placeholder="Currency" />
        <Input name="pdf_url" placeholder="PDF URL placeholder" />
      </div>
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Itinerary JSON</div>
          <Button type="button" variant="outline" size="sm" onClick={() => setDays((current) => [...current, { day: String(current.length + 1), title: "", description: "" }])}><Plus className="h-4 w-4" />Add day</Button>
        </div>
        {days.map((day, index) => (
          <div key={index} className="grid gap-2 rounded-lg border p-3">
            <div className="grid gap-2 md:grid-cols-[100px_1fr_auto]">
              <Input value={day.day} onChange={(event) => setDays((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, day: event.target.value } : item))} type="number" />
              <Input value={day.title} onChange={(event) => setDays((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} placeholder="Day title" />
              <Button type="button" variant="ghost" size="icon" onClick={() => setDays((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" /></Button>
            </div>
            <Textarea value={day.description} onChange={(event) => setDays((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item))} placeholder="Description" />
          </div>
        ))}
      </div>
      <Button disabled={isPending}>Create proposal</Button>
    </form>
  );
}
