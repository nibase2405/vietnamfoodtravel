import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, profile, response } = await requireApiAdmin();
  if (response) return response;
  const { id } = await params;
  const payload = await jsonBody(request);
  if (payload.role && ["admin", "super_admin"].includes(payload.role) && profile?.role !== "super_admin") {
    return NextResponse.json({ error: "Only super_admin can assign admin roles" }, { status: 403 });
  }
  const { data, error } = await supabase.from("users").update(payload).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
