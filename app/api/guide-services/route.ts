import { NextResponse } from "next/server";
import { jsonBody, requireApiRole } from "@/lib/api/guards";

export async function POST(request: Request) {
  const { supabase, response } = await requireApiRole(["guide", "admin", "super_admin"]);
  if (response) return response;
  const { data, error } = await supabase.from("guide_services").insert(await jsonBody(request)).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
