import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";
import { normalizeRankingSettings } from "@/lib/ranking-settings";
import { createClient } from "@/lib/supabase/server";

const SETTING_KEY = "ranking_settings";

export const dynamic = "force-dynamic";

function response(value: unknown, source: "database" | "default") {
  return NextResponse.json({ settings: normalizeRankingSettings(value), source });
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

  const settings = normalizeRankingSettings(await jsonBody(request));
  const { data, error } = await supabase
    .from("site_settings")
    .upsert({ key: SETTING_KEY, value: settings, updated_at: new Date().toISOString() })
    .select("value")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return response(data?.value ?? settings, "database");
}
