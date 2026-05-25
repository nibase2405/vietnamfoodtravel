"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createBooking } from "@/lib/actions/user";
import { bookingSchema } from "@/lib/validations/forms";

type Values = z.infer<typeof bookingSchema>;

export function BookingForm({ type, entityId }: { type: "tour" | "guide" | "custom_trip"; entityId?: string }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.input<typeof bookingSchema>, unknown, Values>({ resolver: zodResolver(bookingSchema) });

  return (
    <form
      id="booking"
      onSubmit={form.handleSubmit((values) => {
        startTransition(() => {
          void (async () => {
            await createBooking({
              ...values,
              booking_type: type,
              tour_id: type === "tour" ? entityId : null,
              guide_service_id: type === "guide" ? entityId : null
            });
            window.alert("Booking request sent");
            form.reset();
          })();
        });
      })}
      className="grid gap-3 rounded-lg border bg-white p-4"
    >
      <div className="font-semibold">Booking form</div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input {...form.register("travel_date")} type="date" />
        <Input {...form.register("people_count")} type="number" placeholder="People" />
      </div>
      <Input {...form.register("contact_name")} placeholder="Name" />
      <div className="grid gap-3 md:grid-cols-2">
        <Input {...form.register("contact_phone")} placeholder="Phone" />
        <Input {...form.register("contact_email")} placeholder="Email" />
      </div>
      <Textarea {...form.register("notes")} placeholder="Notes" />
      {Object.values(form.formState.errors)[0]?.message ? <p className="text-sm text-destructive">{String(Object.values(form.formState.errors)[0]?.message)}</p> : null}
      <Button disabled={form.formState.isSubmitting || isPending}>Send booking</Button>
    </form>
  );
}
