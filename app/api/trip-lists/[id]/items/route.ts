import { NextResponse } from "next/server";
import { jsonBody, requireApiAuth } from "@/lib/api/guards";

type SortableTripListItem = {
  id: string;
  sort_order: number;
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, response } = await requireApiAuth();
  if (response) return response;
  const { id } = await params;
  const { data, error } = await supabase.from("trip_list_items").insert({ ...(await jsonBody(request)), trip_list_id: id }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  const { supabase, response } = await requireApiAuth();
  if (response) return response;
  const payload = await jsonBody(request);
  const items: SortableTripListItem[] = Array.isArray(payload.items) ? payload.items : [];
  const results = await Promise.all(items.map((item) => supabase.from("trip_list_items").update({ sort_order: item.sort_order }).eq("id", item.id)));
  const error = results.find((result) => result.error)?.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
