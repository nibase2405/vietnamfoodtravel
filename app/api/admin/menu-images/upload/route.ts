import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/api/guards";

const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const maxBytes = 4 * 1024 * 1024;

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "尚未設定 Supabase URL、Anon Key 或 Storage bucket，本機預覽會改用瀏覽器暫存圖片。" }, { status: 503 });
  }

  const { supabase, response } = await requireApiAdmin();
  if (response) return response;

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Missing file" }, { status: 400 });
  if (!allowedTypes.includes(file.type)) return NextResponse.json({ error: "Only jpg, png, and webp menu images are supported" }, { status: 400 });
  if (file.size > maxBytes) return NextResponse.json({ error: "File too large. Max size is 4MB" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `menus/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("restaurants").upload(path, file, { cacheControl: "3600" });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const publicUrl = supabase.storage.from("restaurants").getPublicUrl(path).data.publicUrl;
  return NextResponse.json({ bucket: "restaurants", path, publicUrl });
}
