import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";
import {
  defaultRestaurantFilterSettings,
  normalizeRestaurantFilterSettings,
  type RestaurantFilterSettingsResponse
} from "@/lib/restaurant-filter-settings";
import { createClient } from "@/lib/supabase/server";

const SETTING_KEY = "restaurant_filters";

export const dynamic = "force-dynamic";

function withSource(source: RestaurantFilterSettingsResponse["source"], value: unknown): RestaurantFilterSettingsResponse {
  return { ...normalizeRestaurantFilterSettings(value), source };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("site_settings").select("value").eq("key", SETTING_KEY).maybeSingle();
    if (error || !data?.value) {
      return NextResponse.json(withSource("default", defaultRestaurantFilterSettings));
    }
    return NextResponse.json(withSource("database", data.value));
  } catch {
    return NextResponse.json(withSource("default", defaultRestaurantFilterSettings));
  }
}

export async function PATCH(request: Request) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  if (!supabase) return NextResponse.json({ error: "Missing Supabase client" }, { status: 503 });

  const payload = normalizeRestaurantFilterSettings(await jsonBody(request));
  const { data, error } = await supabase
    .from("site_settings")
    .upsert({ key: SETTING_KEY, value: payload, updated_at: new Date().toISOString() })
    .select("value")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(withSource("database", data?.value ?? payload));
}
