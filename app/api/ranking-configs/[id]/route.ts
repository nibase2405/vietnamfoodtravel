import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";
import { normalizeRankingSetting, rankingConfigPayload } from "@/lib/ranking-settings";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function fetchRankingConfig(supabase: Awaited<ReturnType<typeof createClient>>, id: string) {
  const { data, error } = await supabase.from("ranking_configs").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return normalizeRankingSetting(data);
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const config = await fetchRankingConfig(supabase, id);
    return config ? NextResponse.json({ config, source: "database" }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  if (!supabase) return NextResponse.json({ error: "Missing Supabase client" }, { status: 503 });

  const { id } = await params;
  const existing = await fetchRankingConfig(supabase, id);
  if (!existing) return NextResponse.json({ error: "Ranking config not found" }, { status: 404 });
  const config = normalizeRankingSetting({ ...existing, ...(await jsonBody(request)), id: existing.id });
  if (!config) return NextResponse.json({ error: "Invalid ranking config payload" }, { status: 422 });

  const { data, error } = await supabase
    .from("ranking_configs")
    .update(rankingConfigPayload(config))
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidatePath("/rankings");
  return NextResponse.json({ config: normalizeRankingSetting(data) });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  if (!supabase) return NextResponse.json({ error: "Missing Supabase client" }, { status: 503 });
  const { id } = await params;
  const { error } = await supabase.from("ranking_configs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidatePath("/rankings");
  return NextResponse.json({ ok: true });
}
