import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";
import { getPublicKOLBySlugData } from "@/lib/data/queries";
import { kolCorePayload, kolVisitPayload, normalizeKOL } from "@/lib/kols";
import { createClient } from "@/lib/supabase/server";
import type { KOLVisit } from "@/types";

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

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kol = await getPublicKOLBySlugData(slug);
  return kol ? NextResponse.json(kol) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  if (!supabase) return NextResponse.json({ error: "Missing Supabase client" }, { status: 503 });
  const { slug } = await params;
  const existing = await fetchKOLBySlug(supabase, slug);
  if (!existing) return NextResponse.json({ error: "KOL not found" }, { status: 404 });
  const kol = normalizeKOL({ ...existing, ...(await jsonBody(request)), id: existing.id });
  const { data, error } = await supabase.from("kols").update(kolCorePayload(kol)).eq("id", existing.id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  try {
    await replaceVisits(supabase, data.id, kol.visits ?? []);
    return NextResponse.json(await fetchKOLBySlug(supabase, data.slug));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save KOL visits" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  if (!supabase) return NextResponse.json({ error: "Missing Supabase client" }, { status: 503 });
  const { slug } = await params;
  const { error } = await supabase.from("kols").delete().eq("slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
