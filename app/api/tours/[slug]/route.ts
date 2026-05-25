import { NextResponse } from "next/server";
import { requireApiAdmin, jsonBody } from "@/lib/api/guards";
import { replaceTourNested, splitTourPayload } from "@/lib/api/tour-nested";
import { getPublicTourBySlugData } from "@/lib/data/queries";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPublicTourBySlugData(slug);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const { slug } = await params;
  const payload = await jsonBody(request);
  const { tour } = splitTourPayload(payload);
  const { data, error } = await supabase.from("tours").update(tour).eq("slug", slug).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if ("tour_prices" in payload || "itinerary_days" in payload || "tour_inclusions" in payload) {
    const nestedError = await replaceTourNested(supabase, data.id, payload);
    if (nestedError) return NextResponse.json({ error: nestedError.message, tour: data }, { status: 400 });
  }
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const { slug } = await params;
  const { error } = await supabase.from("tours").delete().eq("slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
