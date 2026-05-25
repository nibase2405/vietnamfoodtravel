import { NextResponse } from "next/server";
import { requireApiAdmin, jsonBody } from "@/lib/api/guards";
import { insertTourNested, splitTourPayload } from "@/lib/api/tour-nested";
import { getPublicToursData } from "@/lib/data/queries";

export async function GET() {
  return NextResponse.json(await getPublicToursData());
}

export async function POST(request: Request) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const payload = await jsonBody(request);
  const { tour, prices, itineraryDays, inclusions } = splitTourPayload(payload);
  const { data, error } = await supabase.from("tours").insert(tour).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const nestedError = await insertTourNested(supabase, data.id, { prices, itineraryDays, inclusions });
  if (nestedError) return NextResponse.json({ error: nestedError.message, tour: data }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
