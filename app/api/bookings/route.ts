import { NextResponse } from "next/server";
import { jsonBody, requireApiAuth } from "@/lib/api/guards";

export async function GET() {
  const { supabase, user, profile, response } = await requireApiAuth();
  if (response) return response;
  const query = supabase.from("bookings").select("*").order("created_at", { ascending: false });
  const { data, error } = ["admin", "super_admin"].includes(profile?.role) ? await query : await query.eq("user_id", user?.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { supabase, user, response } = await requireApiAuth();
  if (response) return response;
  const { data, error } = await supabase.from("bookings").insert({ ...(await jsonBody(request)), user_id: user?.id }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
