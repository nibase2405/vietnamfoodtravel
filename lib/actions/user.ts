"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireAuth } from "@/lib/actions/auth";

export async function createBooking(payload: Record<string, unknown>) {
  await requireAuth();
  const supabase = await createClient();
  return supabase.from("bookings").insert(payload).select().single();
}

export async function getMyBookings() {
  const user = await requireAuth();
  const supabase = await createClient();
  return supabase.from("bookings").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
}

export async function updateBookingStatus(id: string, status: string) {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from("bookings").update({ status }).eq("id", id);
}

export async function updatePaymentStatus(id: string, payment_status: string) {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from("bookings").update({ payment_status }).eq("id", id);
}

export async function toggleFavorite(entity_type: string, entity_id: string) {
  const user = await requireAuth();
  const supabase = await createClient();
  const existing = await supabase.from("favorites").select("id").eq("user_id", user.id).eq("entity_type", entity_type).eq("entity_id", entity_id).maybeSingle();
  if (existing.data) return supabase.from("favorites").delete().eq("id", existing.data.id);
  return supabase.from("favorites").insert({ user_id: user.id, entity_type, entity_id });
}

export async function getFavorites() {
  const user = await requireAuth();
  const supabase = await createClient();
  return supabase.from("favorites").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
}

export async function isFavorited(entity_type: string, entity_id: string) {
  const user = await requireAuth();
  const supabase = await createClient();
  return supabase.from("favorites").select("id").eq("user_id", user.id).eq("entity_type", entity_type).eq("entity_id", entity_id).maybeSingle();
}

export async function createTripList(payload: Record<string, unknown>) {
  await requireAuth();
  const supabase = await createClient();
  return supabase.from("trip_lists").insert(payload).select().single();
}

export async function updateTripList(id: string, payload: Record<string, unknown>) {
  await requireAuth();
  const supabase = await createClient();
  return supabase.from("trip_lists").update(payload).eq("id", id).select().single();
}

export async function deleteTripList(id: string) {
  await requireAuth();
  const supabase = await createClient();
  return supabase.from("trip_lists").delete().eq("id", id);
}

export async function addItemToTripList(payload: Record<string, unknown>) {
  await requireAuth();
  const supabase = await createClient();
  return supabase.from("trip_list_items").insert(payload).select().single();
}

export async function reorderTripListItems(items: { id: string; sort_order: number }[]) {
  await requireAuth();
  const supabase = await createClient();
  return Promise.all(items.map((item) => supabase.from("trip_list_items").update({ sort_order: item.sort_order }).eq("id", item.id)));
}

export async function removeTripListItem(id: string) {
  await requireAuth();
  const supabase = await createClient();
  return supabase.from("trip_list_items").delete().eq("id", id);
}

export async function generateTripPlan(prompt: Record<string, unknown>) {
  return {
    prompt,
    generated_itinerary: {
      days: [
        { day: 1, city: "Ho Chi Minh City", items: ["咖啡散步", "戰爭遺跡博物館", "西貢河晚餐"] },
        { day: 2, city: "Mekong Delta", items: ["湄公河一日遊", "在地市場", "返城按摩"] }
      ]
    },
    map_points: [],
    estimated_budget: 450,
    currency: "USD"
  };
}

export async function saveTripPlan(payload: Record<string, unknown>) {
  await requireAuth();
  const supabase = await createClient();
  return supabase.from("ai_trip_plans").insert(payload).select().single();
}

export async function getMyAITripPlans() {
  const user = await requireAuth();
  const supabase = await createClient();
  return supabase.from("ai_trip_plans").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
}

export async function createCustomTripRequest(payload: Record<string, unknown>) {
  const supabase = await createClient();
  return supabase.from("custom_trip_requests").insert({ ...payload, status: "new" }).select().single();
}

export async function getCustomTripRequests() {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from("custom_trip_requests").select("*").order("created_at", { ascending: false });
}

export async function updateCustomTripRequestStatus(id: string, status: string) {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from("custom_trip_requests").update({ status }).eq("id", id);
}

export async function createCustomTripProposal(payload: Record<string, unknown>) {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from("custom_trip_proposals").insert(payload).select().single();
}

export async function getAdminStats() {
  await requireAdmin();
  const supabase = await createClient();
  const [bookings, users, requests, guides, claims] = await Promise.all([
    supabase.from("bookings").select("id,total_amount,created_at"),
    supabase.from("users").select("id,created_at"),
    supabase.from("custom_trip_requests").select("id").eq("status", "new"),
    supabase.from("guides").select("id").eq("status", "pending"),
    supabase.from("restaurant_claims").select("id").eq("status", "pending")
  ]);
  return { bookings: bookings.data ?? [], users: users.data ?? [], requests: requests.data ?? [], guides: guides.data ?? [], claims: claims.data ?? [] };
}

export async function getPendingGuides() {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from("guides").select("*").eq("status", "pending");
}

export async function getPendingRestaurantClaims() {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from("restaurant_claims").select("*, restaurants(*)").eq("status", "pending");
}

export async function getRecentBookings() {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(20);
}

export async function exportBookingsCSV() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("bookings").select("*");
  const rows = data ?? [];
  const header = ["id", "booking_type", "status", "payment_status", "total_amount", "currency", "created_at"];
  return [header.join(","), ...rows.map((row: any) => header.map((key) => JSON.stringify(row[key] ?? "")).join(","))].join("\n");
}
