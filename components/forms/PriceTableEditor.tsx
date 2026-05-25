"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PriceRow = { people_count: string; price_per_person: string; currency: string };

export function PriceTableEditor({ name = "tour_prices" }: { name?: string }) {
  const [rows, setRows] = useState<PriceRow[]>([{ people_count: "2", price_per_person: "399", currency: "USD" }]);
  const value = useMemo(() => JSON.stringify(rows.map((row) => ({ ...row, people_count: Number(row.people_count), price_per_person: Number(row.price_per_person) }))), [rows]);

  return (
    <div className="grid gap-3">
      <input type="hidden" name={name} value={value} />
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Price table</div>
        <Button type="button" variant="outline" size="sm" onClick={() => setRows((current) => [...current, { people_count: "", price_per_person: "", currency: "USD" }])}><Plus className="h-4 w-4" />Add</Button>
      </div>
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
          <Input value={row.people_count} onChange={(event) => setRows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, people_count: event.target.value } : item))} placeholder="People" type="number" />
          <Input value={row.price_per_person} onChange={(event) => setRows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, price_per_person: event.target.value } : item))} placeholder="Price/person" type="number" />
          <Input value={row.currency} onChange={(event) => setRows((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, currency: event.target.value } : item))} placeholder="USD" />
          <Button type="button" variant="ghost" size="icon" onClick={() => setRows((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
    </div>
  );
}
