import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/api/guards";

export async function GET(request: Request) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const url = new URL(request.url);
  const role = url.searchParams.get("role");
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("q");
  let query = supabase.from("users").select("*").order("created_at", { ascending: false });
  if (role) query = query.eq("role", role);
  if (status) query = query.eq("status", status);
  if (search) query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,phone.ilike.%${search}%`);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
