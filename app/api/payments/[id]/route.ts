import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const { id } = await params;
  const payload = await jsonBody(request);
  const update = {
    ...payload,
    paid_at: payload.status === "success" ? new Date().toISOString() : payload.paid_at
  };
  const { data, error } = await supabase.from("payments").update(update).eq("id", id).select("*, bookings(id)").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (payload.status === "success" && data?.booking_id) {
    await supabase.from("bookings").update({ payment_status: "paid" }).eq("id", data.booking_id);
  }
  if (payload.status === "refunded" && data?.booking_id) {
    await supabase.from("bookings").update({ payment_status: "refunded" }).eq("id", data.booking_id);
  }
  return NextResponse.json(data);
}
