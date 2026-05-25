"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCustomTripRequest } from "@/lib/actions/user";
import { customTripRequestSchema } from "@/lib/validations/forms";

type Values = z.infer<typeof customTripRequestSchema>;

function csv(value?: string) {
  return value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
}

export function CustomTripRequestForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.input<typeof customTripRequestSchema>, unknown, Values>({
    resolver: zodResolver(customTripRequestSchema),
    defaultValues: {
      currency: "USD",
      preferred_cities: [],
      interests: [],
      language_preference: [],
      need_guide: false,
      need_car: false,
      need_hotel: false
    } as Partial<z.input<typeof customTripRequestSchema>>
  });

  return (
    <form
      onSubmit={form.handleSubmit((values) => {
        startTransition(() => {
          void (async () => {
            await createCustomTripRequest(values);
            window.alert("Request sent");
            form.reset();
          })();
        });
      })}
      className="grid gap-3"
    >
      <div className="grid gap-3 md:grid-cols-3">
        <Input {...form.register("name")} placeholder="Name" />
        <Input {...form.register("email")} placeholder="Email" />
        <Input {...form.register("phone")} placeholder="Phone" />
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <Input {...form.register("travel_start_date")} type="date" />
        <Input {...form.register("travel_end_date")} type="date" />
        <Input {...form.register("people_count")} type="number" placeholder="People" />
        <Input {...form.register("budget_max")} type="number" placeholder="Max budget" />
      </div>
      <Input {...form.register("budget_min")} type="number" placeholder="Min budget" />
      <Input onChange={(event) => form.setValue("preferred_cities", csv(event.target.value))} placeholder="Cities, comma separated" />
      <Input onChange={(event) => form.setValue("interests", csv(event.target.value))} placeholder="Interests, comma separated" />
      <Input onChange={(event) => form.setValue("language_preference", csv(event.target.value))} placeholder="Languages, comma separated" />
      <div className="grid gap-2 text-sm md:grid-cols-3">
        <label className="flex items-center gap-2"><input type="checkbox" {...form.register("need_guide")} />Need guide</label>
        <label className="flex items-center gap-2"><input type="checkbox" {...form.register("need_car")} />Need car</label>
        <label className="flex items-center gap-2"><input type="checkbox" {...form.register("need_hotel")} />Need hotel</label>
      </div>
      <Textarea {...form.register("admin_notes")} placeholder="Notes" />
      {Object.values(form.formState.errors)[0]?.message ? <p className="text-sm text-destructive">{String(Object.values(form.formState.errors)[0]?.message)}</p> : null}
      <Button disabled={form.formState.isSubmitting || isPending}>Send request</Button>
    </form>
  );
}
