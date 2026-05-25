"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import { MapCoordinatePicker } from "@/components/forms/MapCoordinatePicker";
import { OpeningHoursEditor } from "@/components/forms/OpeningHoursEditor";
import { SEOFields } from "@/components/forms/SEOFields";
import { attractionSchema } from "@/lib/validations/forms";

type Values = z.infer<typeof attractionSchema>;

function readJsonField(formData: FormData, name: string, fallback: unknown) {
  const raw = String(formData.get(name) ?? "");
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function AttractionForm({ mode = "create", slug }: { mode?: "create" | "edit"; slug?: string }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.input<typeof attractionSchema>, unknown, Values>({
    resolver: zodResolver(attractionSchema),
    defaultValues: { status: "draft" } as Partial<z.input<typeof attractionSchema>>
  });

  return (
    <form
      onSubmit={form.handleSubmit((values, event) => {
        const formData = new FormData(event?.currentTarget as HTMLFormElement);
        const payload = {
          ...values,
          opening_hours: readJsonField(formData, "opening_hours", {})
        };
        startTransition(() => {
          void (async () => {
            const response = await fetch(mode === "edit" && slug ? `/api/attractions/${slug}` : "/api/attractions", {
              method: mode === "edit" ? "PATCH" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error("Failed to save attraction");
            window.alert("Attraction saved");
            if (mode === "create") form.reset();
          })().catch((error) => window.alert(error.message));
        });
      })}
      className="grid gap-4"
    >
      <Input {...form.register("name")} placeholder="Attraction name" />
      <Input {...form.register("slug")} placeholder="slug" />
      <Input {...form.register("address")} placeholder="Address" />
      <div className="grid gap-3 md:grid-cols-3"><Input {...form.register("latitude")} type="number" placeholder="Latitude" /><Input {...form.register("longitude")} type="number" placeholder="Longitude" /><Input {...form.register("status")} placeholder="draft / published" /></div>
      {Object.values(form.formState.errors)[0]?.message ? <p className="text-sm text-destructive">{String(Object.values(form.formState.errors)[0]?.message)}</p> : null}
      <ImageUploadField name="cover_image_url" bucket="attractions" onUploaded={(url) => form.setValue("cover_image_url", url)} />
      <OpeningHoursEditor />
      <MapCoordinatePicker onChange={({ latitude, longitude }) => {
        form.setValue("latitude", latitude);
        form.setValue("longitude", longitude);
      }} />
      <SEOFields />
      <Button disabled={form.formState.isSubmitting || isPending}>Save attraction</Button>
    </form>
  );
}
