import { NextResponse } from "next/server";
import { getPublicGuidesData } from "@/lib/data/queries";
import { jsonBody, requireApiAuth } from "@/lib/api/guards";

export async function GET() {
  return NextResponse.json(await getPublicGuidesData());
}

export async function POST(request: Request) {
  const { supabase, user, response } = await requireApiAuth();
  if (response) return response;
  const payload = await jsonBody(request);
  const guidePayload = {
    user_id: user?.id,
    display_name: payload.display_name,
    bio: payload.bio,
    languages: payload.languages,
    service_cities: payload.service_cities,
    specialties: payload.specialties,
    hourly_rate: payload.hourly_rate,
    daily_rate: payload.daily_rate,
    currency: payload.currency ?? "USD",
    status: "pending"
  };
  const { data, error } = await supabase.from("guides").insert(guidePayload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await supabase.from("users").update({ role: "guide", status: "pending", phone: payload.phone, avatar_url: payload.avatar_url }).eq("id", user?.id);
  return NextResponse.json(data, { status: 201 });
}
