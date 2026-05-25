import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const { id } = await params;
  const payload = await jsonBody(request);
  const allowed = ["status", "payment_status", "notes", "total_amount", "travel_date", "people_count"];
  const update = Object.fromEntries(Object.entries(payload).filter(([key]) => allowed.includes(key)));
  const { data, error } = await supabase.from("bookings").update(update).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
