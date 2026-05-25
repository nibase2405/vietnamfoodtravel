"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import { guideApplySchema } from "@/lib/validations/forms";

type Values = z.infer<typeof guideApplySchema>;

function csv(value?: string) {
  return value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
}

export function GuideApplyForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.input<typeof guideApplySchema>, unknown, Values>({
    resolver: zodResolver(guideApplySchema),
    defaultValues: { service_cities: [], languages: [], specialties: [] } as Partial<z.input<typeof guideApplySchema>>
  });

  return (
    <form
      onSubmit={form.handleSubmit((values) => {
        startTransition(() => {
          void (async () => {
            const response = await fetch("/api/guides", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(values)
            });
            if (!response.ok) throw new Error("Failed to submit guide application");
            window.alert("Guide application submitted");
            form.reset();
          })().catch((error) => window.alert(error.message));
        });
      })}
      className="grid gap-3"
    >
      <div className="grid gap-3 md:grid-cols-3">
        <Input {...form.register("display_name")} placeholder="Name" />
        <Input {...form.register("email")} placeholder="Email" />
        <Input {...form.register("phone")} placeholder="Phone" />
      </div>
      <Input onChange={(event) => form.setValue("service_cities", csv(event.target.value))} placeholder="Cities, comma separated" />
      <Input onChange={(event) => form.setValue("languages", csv(event.target.value))} placeholder="Languages, comma separated" />
      <Input onChange={(event) => form.setValue("specialties", csv(event.target.value))} placeholder="Specialties, comma separated" />
      <Textarea {...form.register("bio")} placeholder="Bio" />
      <div className="grid gap-3 md:grid-cols-2">
        <Input {...form.register("hourly_rate")} type="number" placeholder="Hourly rate" />
        <Input {...form.register("daily_rate")} type="number" placeholder="Daily rate" />
      </div>
      {Object.values(form.formState.errors)[0]?.message ? <p className="text-sm text-destructive">{String(Object.values(form.formState.errors)[0]?.message)}</p> : null}
      <ImageUploadField name="avatar_url" bucket="guides" onUploaded={(url) => form.setValue("avatar_url", url)} />
      <Button disabled={form.formState.isSubmitting || isPending}>Submit application</Button>
    </form>
  );
}
