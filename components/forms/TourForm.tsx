"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import { ItineraryDayEditor } from "@/components/forms/ItineraryDayEditor";
import { PriceTableEditor } from "@/components/forms/PriceTableEditor";
import { SEOFields } from "@/components/forms/SEOFields";
import { TourInclusionsEditor } from "@/components/forms/TourInclusionsEditor";
import { TranslationFields } from "@/components/forms/TranslationFields";
import { tourSchema } from "@/lib/validations/forms";

type Values = z.infer<typeof tourSchema>;

function readJsonField(formData: FormData, name: string) {
  const raw = String(formData.get(name) ?? "[]");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function TourForm({ mode = "create", slug }: { mode?: "create" | "edit"; slug?: string }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.input<typeof tourSchema>, unknown, Values>({
    resolver: zodResolver(tourSchema),
    defaultValues: { tour_type: "semi_self_guided", currency: "USD", status: "draft" } as Partial<z.input<typeof tourSchema>>
  });

  return (
    <form
      onSubmit={form.handleSubmit((values, event) => {
        const formData = new FormData(event?.currentTarget as HTMLFormElement);
        const payload = {
          ...values,
          tour_prices: readJsonField(formData, "tour_prices"),
          itinerary_days: readJsonField(formData, "itinerary_days"),
          tour_inclusions: readJsonField(formData, "tour_inclusions")
        };
        startTransition(() => {
          void (async () => {
            const url = mode === "edit" && slug ? `/api/tours/${slug}` : "/api/tours";
            const response = await fetch(url, {
              method: mode === "edit" ? "PATCH" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error("Failed to save tour");
            window.alert("Tour saved");
            if (mode === "create") form.reset();
          })().catch((error) => window.alert(error.message));
        });
      })}
      className="grid gap-5"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Input {...form.register("title")} placeholder="Tour title" />
        <Input {...form.register("slug")} placeholder="slug" />
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        <Input {...form.register("duration_days")} type="number" placeholder="Days" />
        <Input {...form.register("duration_nights")} type="number" placeholder="Nights" />
        <Input {...form.register("min_people")} type="number" placeholder="Min people" />
        <Input {...form.register("max_people")} type="number" placeholder="Max people" />
        <Input {...form.register("base_price")} type="number" placeholder="Base price" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Input {...form.register("tour_type")} placeholder="semi_self_guided" />
        <Input {...form.register("currency")} placeholder="USD" />
        <Input {...form.register("status")} placeholder="draft / published" />
      </div>
      {Object.values(form.formState.errors)[0]?.message ? <p className="text-sm text-destructive">{String(Object.values(form.formState.errors)[0]?.message)}</p> : null}
      <ImageUploadField name="cover_image_url" bucket="tours" onUploaded={(url) => form.setValue("cover_image_url", url)} />
      <PriceTableEditor />
      <ItineraryDayEditor />
      <TourInclusionsEditor />
      <TranslationFields />
      <SEOFields />
      <Button disabled={form.formState.isSubmitting || isPending}>Save tour</Button>
    </form>
  );
}
