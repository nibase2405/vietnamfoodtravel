import { NextResponse } from "next/server";
import { jsonBody, requireApiAuth } from "@/lib/api/guards";

export async function GET() {
  const { supabase, user, response } = await requireApiAuth();
  if (response) return response;
  const { data, error } = await supabase.from("ai_trip_plans").select("*").eq("user_id", user?.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { supabase, user, response } = await requireApiAuth();
  if (response) return response;
  const payload = await jsonBody(request);
  const generated = {
    prompt: payload.prompt ?? {},
    generated_itinerary: payload.generated_itinerary ?? {},
    map_points: payload.map_points ?? [],
    estimated_budget: payload.estimated_budget ?? null,
    currency: payload.currency ?? "USD",
    pdf_url: payload.pdf_url ?? null
  };
  const { data, error } = await supabase.from("ai_trip_plans").insert({ ...generated, user_id: user?.id, destination_id: payload.destination_id ?? null }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
