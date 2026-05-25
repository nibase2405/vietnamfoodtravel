import { NextResponse } from "next/server";
import { jsonBody, requireApiRole } from "@/lib/api/guards";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, response } = await requireApiRole(["guide", "admin", "super_admin"]);
  if (response) return response;
  const { id } = await params;
  const { data, error } = await supabase.from("guide_services").update(await jsonBody(request)).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, response } = await requireApiRole(["guide", "admin", "super_admin"]);
  if (response) return response;
  const { id } = await params;
  const { error } = await supabase.from("guide_services").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
