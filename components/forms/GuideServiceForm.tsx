"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { guideServiceSchema } from "@/lib/validations/forms";

type Values = z.infer<typeof guideServiceSchema>;

export function GuideServiceForm({ guideId }: { guideId?: string }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.input<typeof guideServiceSchema>, unknown, Values>({
    resolver: zodResolver(guideServiceSchema),
    defaultValues: { service_type: "hourly" } as Partial<z.input<typeof guideServiceSchema>>
  });

  return (
    <form
      onSubmit={form.handleSubmit((values, event) => {
        const formData = new FormData(event?.currentTarget as HTMLFormElement);
        startTransition(() => {
          void (async () => {
            const response = await fetch("/api/guide-services", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...values, guide_id: guideId ?? String(formData.get("guide_id") ?? "") })
            });
            if (!response.ok) throw new Error("Failed to save service");
            window.alert("Guide service saved");
            form.reset();
          })().catch((error) => window.alert(error.message));
        });
      })}
      className="grid gap-3"
    >
      {!guideId ? <Input name="guide_id" placeholder="Guide ID" /> : null}
      <Input {...form.register("title")} placeholder="Service title" />
      <Textarea {...form.register("description")} placeholder="Description" />
      <Input {...form.register("service_type")} placeholder="hourly / half_day / full_day" />
      <Input {...form.register("price")} type="number" placeholder="Price" />
      <Input {...form.register("duration_hours")} type="number" placeholder="Duration hours" />
      {Object.values(form.formState.errors)[0]?.message ? <p className="text-sm text-destructive">{String(Object.values(form.formState.errors)[0]?.message)}</p> : null}
      <Button disabled={form.formState.isSubmitting || isPending}>Save service</Button>
    </form>
  );
}
