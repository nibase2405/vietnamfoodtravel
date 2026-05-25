import { NextResponse } from "next/server";
import { jsonBody, requireApiAuth } from "@/lib/api/guards";

export async function GET() {
  const { supabase, user, response } = await requireApiAuth();
  if (response) return response;
  const { data, error } = await supabase.from("trip_lists").select("*, trip_list_items(*)").eq("user_id", user?.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { supabase, user, response } = await requireApiAuth();
  if (response) return response;
  const { data, error } = await supabase.from("trip_lists").insert({ ...(await jsonBody(request)), user_id: user?.id }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
