import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";
import { pickCustomTripProposalPayload } from "@/lib/api/custom-trip-payload";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const { id } = await params;
  const payload = pickCustomTripProposalPayload(await jsonBody(request));
  const { data, error } = await supabase.from("custom_trip_proposals").update(payload).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (payload.status === "accepted" && data?.request_id) {
    await supabase.from("custom_trip_requests").update({ status: "confirmed" }).eq("id", data.request_id);
  }
  if (payload.status === "rejected" && data?.request_id) {
    await supabase.from("custom_trip_requests").update({ status: "cancelled" }).eq("id", data.request_id);
  }
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const { id } = await params;
  const { error } = await supabase.from("custom_trip_proposals").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
