import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";
import { normalizeRankingSetting, normalizeRankingSettings, rankingConfigPayload } from "@/lib/ranking-settings";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function fetchRankingConfig(supabase: Awaited<ReturnType<typeof createClient>>, id: string) {
  const { data, error } = await supabase.from("ranking_configs").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return normalizeRankingSetting(data);
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("ranking_configs").select("*").order("sort_order", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ configs: normalizeRankingSettings(data), source: "database" });
  } catch {
    return NextResponse.json({ configs: [], source: "default" });
  }
}

export async function POST(request: Request) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  if (!supabase) return NextResponse.json({ error: "Missing Supabase client" }, { status: 503 });

  const config = normalizeRankingSetting(await jsonBody(request));
  if (!config) return NextResponse.json({ error: "Invalid ranking config payload" }, { status: 422 });

  const { data, error } = await supabase
    .from("ranking_configs")
    .upsert(rankingConfigPayload(config), { onConflict: "id" })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidatePath("/rankings");
  return NextResponse.json({ config: normalizeRankingSetting(data) ?? await fetchRankingConfig(supabase, config.id) }, { status: 201 });
}
