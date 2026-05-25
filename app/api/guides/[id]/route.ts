import { NextResponse } from "next/server";
import { getPublicGuideByIdData } from "@/lib/data/queries";
import { jsonBody, requireApiAdmin, requireApiRole } from "@/lib/api/guards";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPublicGuideByIdData(id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await requireApiRole(["guide", "admin", "super_admin"]);
  if (context.response) return context.response;
  const { id } = await params;
  const { data, error } = await context.supabase.from("guides").update(await jsonBody(request)).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const { id } = await params;
  const { error } = await supabase.from("guides").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
