"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ItineraryDay = { day_number: string; title: string; description: string; hotel_info: string };

export function ItineraryDayEditor({ name = "itinerary_days" }: { name?: string }) {
  const [days, setDays] = useState<ItineraryDay[]>([{ day_number: "1", title: "", description: "", hotel_info: "" }]);
  const value = useMemo(() => JSON.stringify(days.map((day) => ({ ...day, day_number: Number(day.day_number) }))), [days]);

  return (
    <div className="grid gap-3">
      <input type="hidden" name={name} value={value} />
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Itinerary days</div>
        <Button type="button" variant="outline" size="sm" onClick={() => setDays((current) => [...current, { day_number: String(current.length + 1), title: "", description: "", hotel_info: "" }])}><Plus className="h-4 w-4" />Add day</Button>
      </div>
      {days.map((day, index) => (
        <div key={index} className="grid gap-2 rounded-lg border p-3">
          <div className="grid gap-2 md:grid-cols-[120px_1fr_auto]">
            <Input value={day.day_number} onChange={(event) => setDays((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, day_number: event.target.value } : item))} type="number" placeholder="Day" />
            <Input value={day.title} onChange={(event) => setDays((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} placeholder="Title" />
            <Button type="button" variant="ghost" size="icon" onClick={() => setDays((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" /></Button>
          </div>
          <Textarea value={day.description} onChange={(event) => setDays((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item))} placeholder="Description" />
          <Input value={day.hotel_info} onChange={(event) => setDays((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, hotel_info: event.target.value } : item))} placeholder="Hotel info" />
        </div>
      ))}
    </div>
  );
}
