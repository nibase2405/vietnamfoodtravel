import { NextResponse } from "next/server";
import { jsonBody, requireApiAuth } from "@/lib/api/guards";

export async function GET() {
  const { supabase, user, response } = await requireApiAuth();
  if (response) return response;
  const { data, error } = await supabase.from("users").select("*, user_profiles(*)").eq("id", user?.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const { supabase, user, response } = await requireApiAuth();
  if (response) return response;
  const payload = await jsonBody(request);
  const userFields = ["full_name", "phone", "avatar_url", "preferred_language"];
  const profileFields = ["nationality", "birthday", "gender", "passport_name", "emergency_contact_name", "emergency_contact_phone", "notes"];
  const userUpdate = Object.fromEntries(Object.entries(payload).filter(([key]) => userFields.includes(key)));
  const profileUpdate = Object.fromEntries(Object.entries(payload).filter(([key]) => profileFields.includes(key)));
  if (Object.keys(userUpdate).length) {
    const { error } = await supabase.from("users").update(userUpdate).eq("id", user?.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (Object.keys(profileUpdate).length) {
    const { error } = await supabase.from("user_profiles").upsert({ ...profileUpdate, user_id: user?.id }, { onConflict: "user_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
