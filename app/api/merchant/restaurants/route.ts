import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api/guards";

export async function GET() {
  const { supabase, user, profile, response } = await requireApiRole(["merchant", "admin", "super_admin"]);
  if (response) return response;
  if (["admin", "super_admin"].includes(profile?.role)) {
    const { data, error } = await supabase.from("restaurants").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  }
  const { data, error } = await supabase.from("restaurant_claims").select("restaurants(*)").eq("merchant_user_id", user?.id).eq("status", "approved");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data?.map((row) => row.restaurants).filter(Boolean) ?? []);
}
