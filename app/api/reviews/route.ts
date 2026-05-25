import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin, requireApiAuth } from "@/lib/api/guards";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const entityType = url.searchParams.get("entity_type");
  const entityId = url.searchParams.get("entity_id");
  const admin = url.searchParams.get("admin") === "true";
  const { createClient } = await import("@/lib/supabase/server");
  const publicClient = await createClient();
  if (admin) {
    const { supabase, response } = await requireApiAdmin();
    if (response) return response;
    let query = supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (entityType) query = query.eq("entity_type", entityType);
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  }
  let query = publicClient.from("reviews").select("*").eq("status", "published").order("created_at", { ascending: false });
  if (entityType) query = query.eq("entity_type", entityType);
  if (entityId) query = query.eq("entity_id", entityId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { supabase, user, response } = await requireApiAuth();
  if (response) return response;
  const payload = await jsonBody(request);
  const { data, error } = await supabase.from("reviews").insert({ ...payload, user_id: user?.id, status: "pending" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
