import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";
import { normalizeCityGuideOverrides } from "@/lib/city-guide-settings";
import { createClient } from "@/lib/supabase/server";

const SETTING_KEY = "city_guide_overrides";

export const dynamic = "force-dynamic";

function response(value: unknown, source: "database" | "default") {
  return NextResponse.json({ overrides: normalizeCityGuideOverrides(value), source });
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("site_settings").select("value").eq("key", SETTING_KEY).maybeSingle();
    if (error || !data?.value) return response([], "default");
    return response(data.value, "database");
  } catch {
    return response([], "default");
  }
}

export async function PATCH(request: Request) {
  const { supabase, response: authResponse } = await requireApiAdmin();
  if (authResponse) return authResponse;
  if (!supabase) return NextResponse.json({ error: "Missing Supabase client" }, { status: 503 });

  const overrides = normalizeCityGuideOverrides(await jsonBody(request));
  const { data, error } = await supabase
    .from("site_settings")
    .upsert({ key: SETTING_KEY, value: overrides, updated_at: new Date().toISOString() })
    .select("value")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return response(data?.value ?? overrides, "database");
}
