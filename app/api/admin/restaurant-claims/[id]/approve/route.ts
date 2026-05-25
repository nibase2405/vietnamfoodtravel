import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/api/guards";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const { id } = await params;
  const { data, error } = await supabase.from("restaurant_claims").update({ status: "approved" }).eq("id", id).select("restaurant_id,merchant_user_id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (data?.restaurant_id) await supabase.from("restaurants").update({ status: "claimed" }).eq("id", data.restaurant_id);
  if (data?.merchant_user_id) await supabase.from("users").update({ role: "merchant", status: "active" }).eq("id", data.merchant_user_id);
  return NextResponse.json({ ok: true });
}
