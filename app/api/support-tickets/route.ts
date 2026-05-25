import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin, requireApiAuth } from "@/lib/api/guards";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const admin = url.searchParams.get("admin") === "true";
  if (admin) {
    const { supabase, response } = await requireApiAdmin();
    if (response) return response;
    const { data, error } = await supabase.from("support_tickets").select("*, support_messages(*)").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  }
  const { supabase, user, response } = await requireApiAuth();
  if (response) return response;
  const { data, error } = await supabase.from("support_tickets").select("*, support_messages(*)").eq("user_id", user?.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { supabase, user, response } = await requireApiAuth();
  if (response) return response;
  const payload = await jsonBody(request);
  const { data, error } = await supabase.from("support_tickets").insert({ user_id: user?.id, subject: payload.subject, priority: payload.priority ?? "medium", status: "open" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (payload.message) {
    await supabase.from("support_messages").insert({ ticket_id: data.id, sender_id: user?.id, message: payload.message });
  }
  return NextResponse.json(data, { status: 201 });
}
