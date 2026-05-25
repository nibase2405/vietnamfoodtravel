import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";

export async function GET(request: Request) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const url = new URL(request.url);
  const entityType = url.searchParams.get("entity_type");
  const languageCode = url.searchParams.get("language_code");
  let query = supabase.from("translations").select("*").order("entity_type");
  if (entityType) query = query.eq("entity_type", entityType);
  if (languageCode) query = query.eq("language_code", languageCode);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const { data, error } = await supabase.from("translations").upsert(await jsonBody(request)).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
