import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";
import { pickCustomTripProposalPayload } from "@/lib/api/custom-trip-payload";

export async function GET(request: Request) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const url = new URL(request.url);
  const requestId = url.searchParams.get("request_id");
  let query = supabase.from("custom_trip_proposals").select("*, custom_trip_requests(*)").order("created_at", { ascending: false });
  if (requestId) query = query.eq("request_id", requestId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { supabase, user, response } = await requireApiAdmin();
  if (response) return response;
  const payload = pickCustomTripProposalPayload({ ...(await jsonBody(request)), admin_id: user?.id, status: "draft" });
  const { data, error } = await supabase.from("custom_trip_proposals").insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await supabase.from("custom_trip_requests").update({ status: "quoted" }).eq("id", payload.request_id);
  return NextResponse.json(data, { status: 201 });
}
