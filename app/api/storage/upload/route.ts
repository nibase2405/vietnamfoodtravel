import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api/guards";

const allowedBuckets = ["avatars", "tours", "restaurants", "guides", "attractions", "blog", "documents", "ads"];
const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const maxBytes = 4 * 1024 * 1024;

export async function POST(request: Request) {
  const { supabase, response } = await requireApiAuth();
  if (response) return response;
  const form = await request.formData();
  const bucket = String(form.get("bucket") ?? "");
  const file = form.get("file");
  if (!allowedBuckets.includes(bucket)) return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: "Missing file" }, { status: 400 });
  if (bucket !== "documents" && !allowedTypes.includes(file.type)) return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  if (file.size > maxBytes) return NextResponse.json({ error: "File too large" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: "3600" });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const publicUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  return NextResponse.json({ bucket, path, publicUrl });
}
