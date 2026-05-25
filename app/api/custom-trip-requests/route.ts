import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin, getApiUser } from "@/lib/api/guards";

export async function GET() {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const { data, error } = await supabase.from("custom_trip_requests").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { supabase, user } = await getApiUser();
  if (!supabase) return NextResponse.json({ error: "Missing Supabase environment variables" }, { status: 503 });
  const payload = await jsonBody(request);
  const { data, error } = await supabase.from("custom_trip_requests").insert({ ...payload, user_id: user?.id ?? null, status: "new" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
