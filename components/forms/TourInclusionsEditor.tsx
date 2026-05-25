"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type InclusionRow = { type: "included" | "excluded"; title: string; description: string };

export function TourInclusionsEditor({ name = "tour_inclusions" }: { name?: string }) {
  const [rows, setRows] = useState<InclusionRow[]>([
    { type: "included", title: "Chinese-speaking guide", description: "" },
    { type: "excluded", title: "International flights", description: "" }
  ]);
  const value = useMemo(() => JSON.stringify(rows), [rows]);

  return (
    <div className="grid gap-3">
      <input type="hidden" name={name} value={value} />
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Included / excluded</div>
        <Button type="button" variant="outline" size="sm" onClick={() => setRows((current) => [...current, { type: "included", title: "", description: "" }])}><Plus className="h-4 w-4" />Add</Button>
      </div>
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 md:grid-cols-[140px_1fr_1fr_auto]">
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={row.type}
            onChange={(event) => setRows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, type: event.target.value as InclusionRow["type"] } : item))}
          >
            <option value="included">included</option>
            <option value="excluded">excluded</option>
          </select>
          <Input value={row.title} onChange={(event) => setRows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} placeholder="Title" />
          <Input value={row.description} onChange={(event) => setRows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item))} placeholder="Description" />
          <Button type="button" variant="ghost" size="icon" onClick={() => setRows((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
    </div>
  );
}
