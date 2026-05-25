import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api/guards";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json([]);
  }
  const { supabase, user, response } = await requireApiAuth();
  if (response) return response;
  const { data, error } = await supabase.from("trip_lists").select("id,title,start_date,end_date").eq("user_id", user?.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
