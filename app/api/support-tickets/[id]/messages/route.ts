import { NextResponse } from "next/server";
import { jsonBody, requireApiAuth } from "@/lib/api/guards";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, response } = await requireApiAuth();
  if (response) return response;
  const { id } = await params;
  const payload = await jsonBody(request);
  const { data, error } = await supabase.from("support_messages").insert({ ticket_id: id, sender_id: user?.id, message: payload.message, attachments: payload.attachments ?? [] }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
