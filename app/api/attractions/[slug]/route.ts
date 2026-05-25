import { NextResponse } from "next/server";
import { requireApiAdmin, jsonBody } from "@/lib/api/guards";
import { pickAttractionPayload } from "@/lib/api/attraction-payload";
import { getPublicAttractionBySlugData } from "@/lib/data/queries";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPublicAttractionBySlugData(slug);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const { slug } = await params;
  const { data, error } = await supabase.from("attractions").update(pickAttractionPayload(await jsonBody(request))).eq("slug", slug).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const { slug } = await params;
  const { error } = await supabase.from("attractions").delete().eq("slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
