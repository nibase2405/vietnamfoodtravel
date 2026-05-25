import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";
import { getPublicKOLsData } from "@/lib/data/queries";
import { kolCorePayload, kolVisitPayload, normalizeKOL } from "@/lib/kols";
import { createClient } from "@/lib/supabase/server";
import type { KOLVisit } from "@/types";

export async function GET() {
  return NextResponse.json(await getPublicKOLsData());
}

async function fetchKOLBySlug(supabase: Awaited<ReturnType<typeof createClient>>, slug: string) {
  const { data, error } = await supabase.from("kols").select("*, kol_visits(*)").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? normalizeKOL(data) : null;
}

async function replaceVisits(supabase: Awaited<ReturnType<typeof createClient>>, kolId: string, visits: KOLVisit[]) {
  const { error: deleteError } = await supabase.from("kol_visits").delete().eq("kol_id", kolId);
  if (deleteError) throw deleteError;
  if (!visits.length) return;
  const { error } = await supabase.from("kol_visits").insert(visits.map((visit) => kolVisitPayload(visit, kolId)));
  if (error) throw error;
}

export async function POST(request: Request) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  if (!supabase) return NextResponse.json({ error: "Missing Supabase client" }, { status: 503 });

  const kol = normalizeKOL(await jsonBody(request));
  const { data, error } = await supabase.from("kols").upsert(kolCorePayload(kol), { onConflict: "slug" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  try {
    await replaceVisits(supabase, data.id, kol.visits ?? []);
    return NextResponse.json(await fetchKOLBySlug(supabase, data.slug), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save KOL visits" }, { status: 400 });
  }
}
