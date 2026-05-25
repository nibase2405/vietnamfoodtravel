import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api/guards";

export async function GET() {
  const { supabase, user, response } = await requireApiAuth();
  if (response) return response;
  const { data: requests, error: requestError } = await supabase.from("custom_trip_requests").select("id").eq("user_id", user?.id);
  if (requestError) return NextResponse.json({ error: requestError.message }, { status: 400 });
  const requestIds = requests?.map((request) => request.id) ?? [];
  if (!requestIds.length) return NextResponse.json([]);
  const { data, error } = await supabase.from("custom_trip_proposals").select("*, custom_trip_requests(*)").in("request_id", requestIds).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
