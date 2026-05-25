"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export function ImageUploadField({
  name = "image_url",
  bucket = "avatars",
  onUploaded
}: {
  name?: string;
  bucket?: string;
  onUploaded?: (publicUrl: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState("");
  return (
    <div className="grid gap-2">
      <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        const data = new FormData();
        data.set("bucket", bucket);
        data.set("file", file);
        void fetch("/api/storage/upload", { method: "POST", body: data })
          .then(async (response) => {
            if (!response.ok) throw new Error((await response.json()).error ?? "Upload failed");
            return response.json();
          })
          .then((result) => {
            setPublicUrl(result.publicUrl);
            onUploaded?.(result.publicUrl);
          })
          .catch((error) => window.alert(error.message));
      }} />
      <input type="hidden" name={name} value={publicUrl} />
      {preview ? <img src={preview} alt="preview" className="h-40 rounded-md object-cover" /> : null}
      {publicUrl ? <p className="break-all text-xs text-muted-foreground">{publicUrl}</p> : null}
    </div>
  );
}
