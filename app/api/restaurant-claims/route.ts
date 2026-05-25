import { NextResponse } from "next/server";
import { jsonBody, requireApiRole } from "@/lib/api/guards";

export async function GET() {
  const context = await requireApiRole(["merchant", "admin", "super_admin"]);
  if (context.response) return context.response;
  const query = context.supabase.from("restaurant_claims").select("*, restaurants(*)").order("created_at", { ascending: false });
  const { data, error } = ["admin", "super_admin"].includes(context.profile?.role) ? await query : await query.eq("merchant_user_id", context.user?.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { supabase, user, response } = await requireApiRole(["merchant", "admin", "super_admin"]);
  if (response) return response;
  const { data, error } = await supabase.from("restaurant_claims").insert({ ...(await jsonBody(request)), merchant_user_id: user?.id, status: "pending" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
