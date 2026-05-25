"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { HreflangEditor } from "@/components/forms/HreflangEditor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { seoPageSchema } from "@/lib/validations/forms";

type Values = z.infer<typeof seoPageSchema>;

export function SEOPageForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<Values>({ resolver: zodResolver(seoPageSchema), defaultValues: { language_code: "zh-TW" } as Partial<Values> });

  return (
    <form
      onSubmit={form.handleSubmit((values, event) => {
        const formData = new FormData(event?.currentTarget as HTMLFormElement);
        const payload = {
          ...values,
          hreflang: safeJson(String(formData.get("hreflang") ?? "{}"), {}),
          schema_json: values.schema_json ?? {}
        };
        startTransition(() => {
          void (async () => {
            const response = await fetch("/api/seo-pages", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error("Failed to save SEO page");
            window.alert("SEO page saved");
          })().catch((error) => window.alert(error.message));
        });
      })}
      className="grid gap-3"
    >
      <Input {...form.register("path")} placeholder="/tours" />
      <Input {...form.register("language_code")} placeholder="zh-TW" />
      <Input {...form.register("title")} placeholder="Title" />
      <Textarea {...form.register("description")} placeholder="Description" />
      <Input {...form.register("og_image_url")} placeholder="OG image URL" />
      <Textarea onChange={(event) => {
        try {
          form.setValue("schema_json", JSON.parse(event.target.value));
        } catch {
          form.setValue("schema_json", {});
        }
      }} placeholder="JSON-LD" />
      <HreflangEditor />
      {Object.values(form.formState.errors)[0]?.message ? <p className="text-sm text-destructive">{String(Object.values(form.formState.errors)[0]?.message)}</p> : null}
      <Button disabled={form.formState.isSubmitting || isPending}>Save SEO</Button>
    </form>
  );
}

function safeJson(raw: string, fallback: unknown) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
