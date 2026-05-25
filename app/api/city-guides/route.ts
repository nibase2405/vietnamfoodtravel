import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";
import {
  cityGuideCorePayload,
  cityGuideTranslationPayload,
  defaultCityGuideRecords,
  normalizeCityGuideRecord,
  normalizeCityGuideRecords,
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
    const hasContent =
      translation.title ||
      translation.summary ||
      translation.seo_title ||
      translation.seo_description ||
      Object.values(translation.content ?? {}).some((value) => Array.isArray(value) ? value.length > 0 : Boolean(value));
    if (!hasContent) continue;
    const { error } = await supabase
      .from("city_guide_translations")
      .upsert(cityGuideTranslationPayload(translation, cityGuideId), { onConflict: "city_guide_id,language_code" });
    if (error) throw error;
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("city_guides")
      .select("*, city_guide_translations(*)")
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true });
    if (error) throw error;
    const guides = normalizeCityGuideRecords(data);
    return NextResponse.json({ guides: guides.length ? guides : defaultCityGuideRecords(), source: guides.length ? "database" : "default" });
  } catch {
    return NextResponse.json({ guides: defaultCityGuideRecords(), source: "default" });
  }
}

export async function POST(request: Request) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  if (!supabase) return NextResponse.json({ error: "Missing Supabase client" }, { status: 503 });

  const record = normalizeCityGuideRecord(await jsonBody(request));
  if (!record) return NextResponse.json({ error: "Invalid city guide payload" }, { status: 422 });

  const { data, error } = await supabase
    .from("city_guides")
    .upsert(cityGuideCorePayload(record), { onConflict: "slug" })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  try {
    await saveTranslations(supabase, data.id, record.translations);
    const guide = await fetchCityGuideBySlug(supabase, data.slug);
    clearPublicCityGuideCache();
    revalidatePath("/city-guides");
    revalidatePath(`/city-guides/${data.slug}`);
    return NextResponse.json({ guide }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save translations" }, { status: 400 });
  }
}
