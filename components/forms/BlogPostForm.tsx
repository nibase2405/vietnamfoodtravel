"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlogContentEditor } from "@/components/forms/BlogContentEditor";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import { SEOFields } from "@/components/forms/SEOFields";
import { blogPostSchema } from "@/lib/validations/forms";

type Values = z.infer<typeof blogPostSchema>;

function readJsonField(formData: FormData, name: string, fallback: unknown) {
  const raw = String(formData.get(name) ?? "");
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function BlogPostForm({ mode = "create", slug }: { mode?: "create" | "edit"; slug?: string }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.input<typeof blogPostSchema>, unknown, Values>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: { status: "draft", content: { blocks: [] } } as Partial<z.input<typeof blogPostSchema>>
  });

  return (
    <form
      onSubmit={form.handleSubmit((values, event) => {
        const formData = new FormData(event?.currentTarget as HTMLFormElement);
        const payload = {
          ...values,
          tags: String(formData.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
          content: readJsonField(formData, "content", { blocks: [] }),
          seo_title: String(formData.get("seo_title") ?? ""),
          seo_description: String(formData.get("seo_description") ?? ""),
          canonical_url: String(formData.get("canonical_url") ?? "")
        };
        startTransition(() => {
          void (async () => {
            const response = await fetch(mode === "edit" && slug ? `/api/blog/${slug}` : "/api/blog", {
              method: mode === "edit" ? "PATCH" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error("Failed to save blog post");
            window.alert("Blog post saved");
            if (mode === "create") form.reset();
          })().catch((error) => window.alert(error.message));
        });
      })}
      className="grid gap-3"
    >
      <Input {...form.register("title")} placeholder="Post title" />
      <Input {...form.register("slug")} placeholder="slug" />
      <Input {...form.register("category")} placeholder="Category" />
      <Input name="tags" placeholder="Tags, comma separated" />
      <Input {...form.register("status")} placeholder="draft / published / archived" />
      <ImageUploadField name="cover_image_url" bucket="blog" onUploaded={(url) => form.setValue("cover_image_url", url)} />
      <BlogContentEditor />
      {Object.values(form.formState.errors)[0]?.message ? <p className="text-sm text-destructive">{String(Object.values(form.formState.errors)[0]?.message)}</p> : null}
      <SEOFields />
      <Button disabled={form.formState.isSubmitting || isPending}>Save post</Button>
    </form>
  );
}
