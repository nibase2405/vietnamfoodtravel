"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export function OpeningHoursEditor({ name = "opening_hours" }: { name?: string }) {
  const [hours, setHours] = useState<Record<string, string>>({
    mon: "09:00-18:00",
    tue: "09:00-18:00",
    wed: "09:00-18:00",
    thu: "09:00-18:00",
    fri: "09:00-18:00",
    sat: "",
    sun: ""
  });
  const value = useMemo(() => JSON.stringify(hours), [hours]);

  return (
    <div className="grid gap-2">
      <input type="hidden" name={name} value={value} />
      <div className="text-sm font-medium">Opening hours</div>
      <div className="grid gap-2 md:grid-cols-2">
        {days.map((day) => (
          <label key={day} className="grid gap-1 text-sm">
            {day.toUpperCase()}
            <Input value={hours[day] ?? ""} onChange={(event) => setHours((current) => ({ ...current, [day]: event.target.value }))} placeholder="09:00-18:00 or closed" />
          </label>
        ))}
      </div>
    </div>
  );
}
