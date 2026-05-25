"use client";

import { createClient } from "@/lib/supabase/browser";

const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const maxBytes = 4 * 1024 * 1024;

export async function uploadImage(bucket: string, file: File) {
  if (!allowedTypes.includes(file.type)) throw new Error("僅支援 jpg, jpeg, png, webp");
  if (file.size > maxBytes) throw new Error("圖片不可超過 4MB");
  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: "3600" });
  if (error) throw error;
  return { path, publicUrl: getPublicUrl(bucket, path) };
}

export async function deleteImage(bucket: string, path: string) {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export function getPublicUrl(bucket: string, path: string) {
  const supabase = createClient();
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
