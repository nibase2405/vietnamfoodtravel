"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import { adCampaignSchema } from "@/lib/validations/forms";

type Values = z.infer<typeof adCampaignSchema>;

export function AdCampaignForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.input<typeof adCampaignSchema>, unknown, Values>({
    resolver: zodResolver(adCampaignSchema),
    defaultValues: { placement: "homepage_banner" } as Partial<z.input<typeof adCampaignSchema>>
  });

  return (
    <form
      onSubmit={form.handleSubmit((values) => {
        startTransition(() => {
          void (async () => {
            const response = await fetch("/api/ads", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(values)
            });
            if (!response.ok) throw new Error("Failed to save campaign");
            window.alert("Campaign saved");
            form.reset();
          })().catch((error) => window.alert(error.message));
        });
      })}
      className="grid gap-3"
    >
      <Input {...form.register("title")} placeholder="Campaign title" />
      <Input {...form.register("placement")} placeholder="homepage_banner" />
      <Input {...form.register("target_city")} placeholder="Target city" />
      <div className="grid gap-3 md:grid-cols-2"><Input {...form.register("start_date")} type="date" /><Input {...form.register("end_date")} type="date" /></div>
      <Input {...form.register("budget")} type="number" placeholder="Budget" />
      <Input {...form.register("link_url")} placeholder="https://..." />
      {Object.values(form.formState.errors)[0]?.message ? <p className="text-sm text-destructive">{String(Object.values(form.formState.errors)[0]?.message)}</p> : null}
      <ImageUploadField name="image_url" bucket="ads" onUploaded={(url) => form.setValue("image_url", url)} />
      <Button disabled={form.formState.isSubmitting || isPending}>Save campaign</Button>
    </form>
  );
}
