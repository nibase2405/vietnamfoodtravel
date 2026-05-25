import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";
import { createClient } from "@/lib/supabase/server";

const defaultSettings = {
  site_name: "Vietnam Travel Platform",
  contact_email: "",
  line_url: "",
  whatsapp_url: "",
  zalo_url: "",
  messenger_url: "",
  default_currency: "USD",
  enabled_languages: ["zh-TW", "zh-CN", "en", "vi"]
};

export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("value").eq("key", "site").maybeSingle();
    return NextResponse.json(data?.value ?? defaultSettings);
  } catch {
    return NextResponse.json(defaultSettings);
  }
}

export async function PATCH(request: Request) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const payload = await jsonBody(request);
  const { data, error } = await supabase.from("site_settings").upsert({ key: "site", value: payload, updated_at: new Date().toISOString() }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
