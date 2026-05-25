"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import { MapCoordinatePicker } from "@/components/forms/MapCoordinatePicker";
import { SEOFields } from "@/components/forms/SEOFields";
import { TranslationFields } from "@/components/forms/TranslationFields";
import { destinationSchema } from "@/lib/validations/forms";

type Values = z.infer<typeof destinationSchema>;

export function DestinationForm({ mode = "create", slug }: { mode?: "create" | "edit"; slug?: string }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.input<typeof destinationSchema>, unknown, Values>({
    resolver: zodResolver(destinationSchema),
    defaultValues: { country: "Vietnam", region: "south", status: "draft", sort_order: 0 } as Partial<z.input<typeof destinationSchema>>
  });

  return (
    <form
      className="grid gap-5"
      onSubmit={form.handleSubmit((values) => {
        startTransition(() => {
          void (async () => {
            const response = await fetch(mode === "edit" && slug ? `/api/destinations/${slug}` : "/api/destinations", {
              method: mode === "edit" ? "PATCH" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(values)
            });
            if (!response.ok) throw new Error("Failed to save destination");
            window.alert("Destination saved");
            if (mode === "create") form.reset();
          })().catch((error) => window.alert(error.message));
        });
      })}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Input {...form.register("city")} placeholder="City" />
        <Input {...form.register("slug")} placeholder="slug" />
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <Input {...form.register("country")} placeholder="Country" />
        <Input {...form.register("region")} placeholder="north / central / south" />
        <Input {...form.register("status")} placeholder="draft / published" />
        <Input {...form.register("sort_order")} type="number" placeholder="Sort order" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input {...form.register("latitude")} type="number" step="any" placeholder="Latitude" />
        <Input {...form.register("longitude")} type="number" step="any" placeholder="Longitude" />
      </div>
      {Object.values(form.formState.errors)[0]?.message ? <p className="text-sm text-destructive">{String(Object.values(form.formState.errors)[0]?.message)}</p> : null}
      <ImageUploadField name="cover_image_url" bucket="attractions" onUploaded={(url) => form.setValue("cover_image_url", url)} />
      <MapCoordinatePicker onChange={({ latitude, longitude }) => {
        form.setValue("latitude", latitude);
        form.setValue("longitude", longitude);
      }} />
      <TranslationFields />
      <SEOFields />
      <Button disabled={form.formState.isSubmitting || isPending}>Save destination</Button>
    </form>
  );
}
