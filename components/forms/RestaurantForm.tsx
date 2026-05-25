"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleBusinessImportField } from "@/components/forms/GoogleBusinessImportField";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import { MapCoordinatePicker } from "@/components/forms/MapCoordinatePicker";
import { MenuImagesUploadField } from "@/components/forms/MenuImagesUploadField";
import { OpeningHoursEditor } from "@/components/forms/OpeningHoursEditor";
import { RestaurantMenuEditor } from "@/components/forms/RestaurantMenuEditor";
import { SEOFields } from "@/components/forms/SEOFields";
import { restaurantSchema } from "@/lib/validations/forms";

type Values = z.infer<typeof restaurantSchema>;

function readJsonField(formData: FormData, name: string, fallback: unknown) {
  const raw = String(formData.get(name) ?? "");
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function RestaurantForm({
  mode = "create",
  slug,
  allowAdminImports = false
}: {
  mode?: "create" | "edit";
  slug?: string;
  allowAdminImports?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.input<typeof restaurantSchema>, unknown, Values>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: { price_range: "medium", status: "draft" } as Partial<z.input<typeof restaurantSchema>>
  });

  return (
    <form
      onSubmit={form.handleSubmit((values, event) => {
        const formData = new FormData(event?.currentTarget as HTMLFormElement);
        const payload = {
          ...values,
          opening_hours: readJsonField(formData, "opening_hours", {}),
          ...(allowAdminImports
            ? {
                menu_images: readJsonField(formData, "menu_images", []),
                restaurant_menu_items: readJsonField(formData, "restaurant_menu_items", [])
              }
            : {})
        };
        startTransition(() => {
          void (async () => {
            const response = await fetch(mode === "edit" && slug ? `/api/restaurants/${slug}` : "/api/restaurants", {
              method: mode === "edit" ? "PATCH" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            if (!response.ok) {
              const body = await response.json().catch(() => ({}));
              throw new Error(body.error ?? "餐廳儲存失敗");
            }
            window.alert("餐廳資料已儲存");
            if (mode === "create") form.reset();
          })().catch((error) => window.alert(error.message));
        });
      })}
      className="grid gap-4"
    >
      {allowAdminImports ? (
        <GoogleBusinessImportField
          onImported={(data) => {
            if (data.name) form.setValue("name", data.name);
            if (data.slug) form.setValue("slug", data.slug);
            if (data.address) form.setValue("address", data.address);
            if (data.latitude !== undefined) form.setValue("latitude", data.latitude);
            if (data.longitude !== undefined) form.setValue("longitude", data.longitude);
            if (data.phone) form.setValue("phone", data.phone);
            if (data.website_url) form.setValue("website_url", data.website_url);
            form.setValue("google_maps_url", data.google_maps_url);
          }}
        />
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <Input {...form.register("name")} placeholder="餐廳名稱" />
        <Input {...form.register("slug")} placeholder="restaurant-slug" />
      </div>
      <Input {...form.register("address")} placeholder="地址" />
      <div className="grid gap-3 md:grid-cols-3">
        <Input {...form.register("phone")} placeholder="電話" />
        <Input {...form.register("website_url")} placeholder="官方網站 URL" />
        <Input {...form.register("google_maps_url")} placeholder="Google Maps URL" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Input {...form.register("price_range")} placeholder="價格區間：low / medium / high / luxury" />
        <Input {...form.register("latitude")} type="number" step="any" placeholder="Latitude" />
        <Input {...form.register("longitude")} type="number" step="any" placeholder="Longitude" />
      </div>
      {Object.values(form.formState.errors)[0]?.message ? <p className="text-sm text-destructive">{String(Object.values(form.formState.errors)[0]?.message)}</p> : null}
      <ImageUploadField name="cover_image_url" bucket="restaurants" onUploaded={(url) => form.setValue("cover_image_url", url)} />
      <OpeningHoursEditor />
      {allowAdminImports ? (
        <>
          <MenuImagesUploadField />
          <RestaurantMenuEditor />
        </>
      ) : null}
      <MapCoordinatePicker onChange={({ latitude, longitude }) => {
        form.setValue("latitude", latitude);
        form.setValue("longitude", longitude);
      }} />
      <SEOFields />
      <Button disabled={form.formState.isSubmitting || isPending}>儲存餐廳</Button>
    </form>
  );
}
