import { NextResponse } from "next/server";
import { requireApiAdmin, jsonBody } from "@/lib/api/guards";
import { pickAttractionPayload } from "@/lib/api/attraction-payload";
import { getPublicAttractionsData } from "@/lib/data/queries";

export async function GET() {
  return NextResponse.json(await getPublicAttractionsData());
}

export async function POST(request: Request) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const { data, error } = await supabase.from("attractions").insert(pickAttractionPayload(await jsonBody(request))).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
