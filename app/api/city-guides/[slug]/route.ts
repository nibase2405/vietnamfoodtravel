import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";
import {
  cityGuideCorePayload,
  cityGuideTranslationPayload,
  defaultCityGuideRecords,
  normalizeCityGuideRecord,
  type CityGuideTranslationRecord
} from "@/lib/city-guide-records";
import { clearPublicCityGuideCache } from "@/lib/data/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function fetchCityGuideBySlug(supabase: Awaited<ReturnType<typeof createClient>>, slug: string) {
  const { data, error } = await supabase
    .from("city_guides")
    .select("*, city_guide_translations(*)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return normalizeCityGuideRecord(data);
}

async function saveTranslations(supabase: Awaited<ReturnType<typeof createClient>>, cityGuideId: string, translations: CityGuideTranslationRecord[]) {
  for (const translation of translations) {
    const { error } = await supabase
      .from("city_guide_translations")
      .upsert(cityGuideTranslationPayload(translation, cityGuideId), { onConflict: "city_guide_id,language_code" });
    if (error) throw error;
  }
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const supabase = await createClient();
    const guide = await fetchCityGuideBySlug(supabase, slug);
    if (guide) return NextResponse.json({ guide, source: "database" });
  } catch {
    const guide = defaultCityGuideRecords().find((item) => item.slug === slug) ?? null;
    if (guide) return NextResponse.json({ guide, source: "default" });
  }
  const fallback = defaultCityGuideRecords().find((item) => item.slug === slug) ?? null;
  return fallback ? NextResponse.json({ guide: fallback, source: "default" }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  if (!supabase) return NextResponse.json({ error: "Missing Supabase client" }, { status: 503 });

  const { slug } = await params;
  const existing = await fetchCityGuideBySlug(supabase, slug);
  if (!existing) return NextResponse.json({ error: "City guide not found" }, { status: 404 });

  const payload = await jsonBody(request);
  const record = normalizeCityGuideRecord({ ...existing, ...payload, id: existing.id, slug: (payload as Record<string, unknown>).slug ?? existing.slug });
  if (!record) return NextResponse.json({ error: "Invalid city guide payload" }, { status: 422 });

  const { data, error } = await supabase
    .from("city_guides")
    .update(cityGuideCorePayload(record))
    .eq("id", existing.id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  try {
    await saveTranslations(supabase, data.id, record.translations);
    clearPublicCityGuideCache();
    revalidatePath("/city-guides");
    revalidatePath(`/city-guides/${slug}`);
    revalidatePath(`/city-guides/${data.slug}`);
    return NextResponse.json({ guide: await fetchCityGuideBySlug(supabase, data.slug) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save translations" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  if (!supabase) return NextResponse.json({ error: "Missing Supabase client" }, { status: 503 });
  const { slug } = await params;
  const { error } = await supabase.from("city_guides").delete().eq("slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  clearPublicCityGuideCache();
  revalidatePath("/city-guides");
  revalidatePath(`/city-guides/${slug}`);
  return NextResponse.json({ ok: true });
}
