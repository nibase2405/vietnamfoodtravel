"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireAuth } from "@/lib/actions/auth";

type QueryOptions = Record<string, string | string[] | undefined>;

function applyBasicFilters(query: any, options: QueryOptions) {
  Object.entries(options).forEach(([key, value]) => {
    if (!value || key === "sort") return;
    if (Array.isArray(value)) query = query.contains(key, value);
    else query = query.eq(key, value);
  });
  return query;
}

export async function getDestinations() {
  const supabase = await createClient();
  return supabase.from("destinations").select("*").eq("status", "published").order("sort_order");
}

export async function getDestinationBySlug(slug: string) {
  const supabase = await createClient();
  return supabase.from("destinations").select("*").eq("slug", slug).single();
}

export async function createDestination(payload: Record<string, unknown>) {
  await requireAdmin();
  const supabase = await createClient();
  const result = await supabase.from("destinations").insert(payload).select().single();
  revalidatePath("/");
  return result;
}

export async function updateDestination(id: string, payload: Record<string, unknown>) {
  await requireAdmin();
  const supabase = await createClient();
  const result = await supabase.from("destinations").update(payload).eq("id", id).select().single();
  revalidatePath("/");
  return result;
}

export async function getTours(options: QueryOptions = {}) {
  const supabase = await createClient();
  let query = supabase.from("tours").select("*, destinations(*)").eq("status", "published");
  query = applyBasicFilters(query, options);
  if (options.sort === "price_asc") query = query.order("base_price", { ascending: true });
  else if (options.sort === "price_desc") query = query.order("base_price", { ascending: false });
  else query = query.order("created_at", { ascending: false });
  return query;
}

export async function getTourBySlug(slug: string) {
  const supabase = await createClient();
  return supabase
    .from("tours")
    .select("*, destinations(*), tour_itinerary_days(*, tour_itinerary_items(*)), tour_inclusions(*), tour_prices(*)")
    .eq("slug", slug)
    .single();
}

export async function createTour(payload: Record<string, unknown>) {
  await requireAdmin();
  const supabase = await createClient();
  const result = await supabase.from("tours").insert(payload).select().single();
  revalidatePath("/tours");
  return result;
}

export async function updateTour(id: string, payload: Record<string, unknown>) {
  await requireAdmin();
  const supabase = await createClient();
  const result = await supabase.from("tours").update(payload).eq("id", id).select().single();
  revalidatePath("/tours");
  return result;
}

export async function deleteTour(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from("tours").delete().eq("id", id);
}

export async function publishTour(id: string) {
  return updateTour(id, { status: "published" });
}

export async function unpublishTour(id: string) {
  return updateTour(id, { status: "draft" });
}

export async function getRestaurants(options: QueryOptions = {}) {
  const supabase = await createClient();
  let query = supabase.from("restaurants").select("*, destinations(*)").in("status", ["published", "claimed"]);
  query = applyBasicFilters(query, options);
  return query.order("is_featured", { ascending: false }).order("rating_avg", { ascending: false });
}

export async function getRestaurantBySlug(slug: string) {
  const supabase = await createClient();
  return supabase.from("restaurants").select("*, destinations(*), restaurant_menu_items(*)").eq("slug", slug).single();
}

export async function createRestaurant(payload: Record<string, unknown>) {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from("restaurants").insert(payload).select().single();
}

export async function updateRestaurant(id: string, payload: Record<string, unknown>) {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from("restaurants").update(payload).eq("id", id).select().single();
}

export async function claimRestaurant(payload: Record<string, unknown>) {
  await requireAuth();
  const supabase = await createClient();
  return supabase.from("restaurant_claims").insert(payload).select().single();
}

export async function approveRestaurantClaim(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from("restaurant_claims").update({ status: "approved" }).eq("id", id);
}

export async function rejectRestaurantClaim(id: string, admin_note?: string) {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from("restaurant_claims").update({ status: "rejected", admin_note }).eq("id", id);
}

export async function getAttractions(options: QueryOptions = {}) {
  const supabase = await createClient();
  let query = supabase.from("attractions").select("*, destinations(*)").eq("status", "published");
  query = applyBasicFilters(query, options);
  return query.order("rating_avg", { ascending: false });
}

export async function getAttractionBySlug(slug: string) {
  const supabase = await createClient();
  return supabase.from("attractions").select("*, destinations(*)").eq("slug", slug).single();
}

export async function createAttraction(payload: Record<string, unknown>) {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from("attractions").insert(payload).select().single();
}

export async function updateAttraction(id: string, payload: Record<string, unknown>) {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from("attractions").update(payload).eq("id", id).select().single();
}

export async function getBlogPosts() {
  const supabase = await createClient();
  return supabase.from("blog_posts").select("*").eq("status", "published").order("published_at", { ascending: false });
}

export async function getBlogPostBySlug(slug: string) {
  const supabase = await createClient();
  return supabase.from("blog_posts").select("*").eq("slug", slug).single();
}

export async function createBlogPost(payload: Record<string, unknown>) {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from("blog_posts").insert(payload).select().single();
}

export async function updateBlogPost(id: string, payload: Record<string, unknown>) {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from("blog_posts").update(payload).eq("id", id).select().single();
}

export async function publishBlogPost(id: string) {
  return updateBlogPost(id, { status: "published", published_at: new Date().toISOString() });
}
