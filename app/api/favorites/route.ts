import { NextResponse } from "next/server";
import { jsonBody, requireApiAuth } from "@/lib/api/guards";

export async function GET() {
  const { supabase, user, response } = await requireApiAuth();
  if (response) return response;
  const { data, error } = await supabase.from("favorites").select("*").eq("user_id", user?.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const payload = await jsonBody(request);
  const { supabase, user, response } = await requireApiAuth();
  if (response) {
    if (response.status === 401 || response.status === 503) {
      return NextResponse.json({ favorited: Boolean(payload.favorited), synced: false });
    }
    return response;
  }
  const existing = await supabase.from("favorites").select("id").eq("user_id", user?.id).eq("entity_type", payload.entity_type).eq("entity_id", payload.entity_id).maybeSingle();
  if (existing.data) {
    const { error } = await supabase.from("favorites").delete().eq("id", existing.data.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ favorited: false });
  }
  const { data, error } = await supabase.from("favorites").insert({ ...payload, user_id: user?.id }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ favorited: true, favorite: data }, { status: 201 });
}
