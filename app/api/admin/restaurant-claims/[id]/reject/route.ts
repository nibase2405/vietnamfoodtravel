import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const { id } = await params;
  const payload = await jsonBody(request);
  const { error } = await supabase.from("restaurant_claims").update({ status: "rejected", admin_note: payload.admin_note ?? null }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
