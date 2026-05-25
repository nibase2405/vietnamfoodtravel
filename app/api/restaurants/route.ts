import { NextResponse } from "next/server";
import { requireApiAdmin, jsonBody } from "@/lib/api/guards";
import { insertRestaurantNested, splitRestaurantPayload } from "@/lib/api/restaurant-nested";
import { getPublicRestaurantsData } from "@/lib/data/queries";

export async function GET() {
  return NextResponse.json(await getPublicRestaurantsData());
}

export async function POST(request: Request) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const payload = await jsonBody(request);
  const { restaurant, menuItems } = splitRestaurantPayload(payload);
  const { data, error } = await supabase.from("restaurants").insert(restaurant).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const nestedError = await insertRestaurantNested(supabase, data.id, { menuItems });
  if (nestedError) return NextResponse.json({ error: nestedError.message, restaurant: data }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
