import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/api/guards";

export async function GET() {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const [bookings, users, requests, pendingGuides, pendingClaims] = await Promise.all([
    supabase.from("bookings").select("id,total_amount,created_at"),
    supabase.from("users").select("id,created_at"),
    supabase.from("custom_trip_requests").select("id").eq("status", "new"),
    supabase.from("guides").select("id").eq("status", "pending"),
    supabase.from("restaurant_claims").select("id").eq("status", "pending")
  ]);
  return NextResponse.json({
    bookings: bookings.data ?? [],
    users: users.data ?? [],
    new_custom_trip_requests: requests.data?.length ?? 0,
    pending_guides: pendingGuides.data?.length ?? 0,
    pending_restaurant_claims: pendingClaims.data?.length ?? 0
  });
}
