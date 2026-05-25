import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api/guards";

export async function GET() {
  const { supabase, user, response } = await requireApiRole(["guide", "admin", "super_admin"]);
  if (response) return response;
  const { data, error } = await supabase.from("guides").select("*, guide_services(*), guide_availability(*)").eq("user_id", user?.id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
