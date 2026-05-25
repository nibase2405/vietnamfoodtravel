import { NextResponse } from "next/server";
import { jsonBody, requireApiRole } from "@/lib/api/guards";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, profile, response } = await requireApiRole(["guide", "admin", "super_admin"]);
  if (response) return response;
  const { id } = await params;
  const payload = await jsonBody(request);
  if (!["confirmed", "cancelled"].includes(payload.status)) {
    return NextResponse.json({ error: "Unsupported guide booking status" }, { status: 400 });
  }
  if (!["admin", "super_admin"].includes(profile?.role)) {
    const { data: booking } = await supabase.from("bookings").select("guide_service_id").eq("id", id).single();
    const { data: service } = await supabase.from("guide_services").select("guides(user_id)").eq("id", booking?.guide_service_id).single();
    const serviceRow = service as { guides?: { user_id?: string } | { user_id?: string }[] } | null;
    const owner = Array.isArray(serviceRow?.guides) ? serviceRow.guides[0]?.user_id : serviceRow?.guides?.user_id;
    if (owner !== user?.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { data, error } = await supabase.from("bookings").update({ status: payload.status }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
