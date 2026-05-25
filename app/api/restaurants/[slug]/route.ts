import { NextResponse } from "next/server";
import { requireApiAdmin, jsonBody, requireApiRole } from "@/lib/api/guards";
import { replaceRestaurantNested, splitRestaurantPayload } from "@/lib/api/restaurant-nested";
import { getPublicRestaurantBySlugData } from "@/lib/data/queries";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPublicRestaurantBySlugData(slug);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const payload = await jsonBody(request);
  const { supabase, profile, response } = await requireApiRole(["merchant", "admin", "super_admin"]);
  if (response) {
    if (response.status === 503) {
      return NextResponse.json({ slug, demo: true, synced: false, payload });
    }
    return response;
  }
  const isAdmin = ["admin", "super_admin"].includes(profile?.role);
  const adminOnlyFields = ["restaurant_menu_items", "menu_images", "google_maps_url"];
  if (!isAdmin && adminOnlyFields.some((field) => field in payload)) {
    return NextResponse.json({ error: "Only admins can import Google business data or upload restaurant menus" }, { status: 403 });
  }
  const { restaurant, menuItems } = splitRestaurantPayload(payload);
  const { data, error } = await supabase.from("restaurants").update(restaurant).eq("slug", slug).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if ("restaurant_menu_items" in payload) {
    const nestedError = await replaceRestaurantNested(supabase, data.id, { menuItems });
    if (nestedError) return NextResponse.json({ error: nestedError.message, restaurant: data }, { status: 400 });
  }
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const { slug } = await params;
  const { error } = await supabase.from("restaurants").delete().eq("slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
