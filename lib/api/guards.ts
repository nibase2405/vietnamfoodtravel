import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function getApiUser() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { supabase: null, user: null, profile: null, configError: "Missing Supabase environment variables" };
  }
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase.from("users").select("*").eq("id", data.user.id).single();
  return { supabase, user: data.user, profile };
}

export async function requireApiAuth() {
  const context = await getApiUser();
  if (context.configError) return { ...context, response: NextResponse.json({ error: context.configError }, { status: 503 }) };
  if (!context.user) return { ...context, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { ...context, response: null };
}

export async function requireApiAdmin() {
  const context = await requireApiAuth();
  if (context.response) return context;
  if (!["admin", "super_admin"].includes(context.profile?.role)) {
    return { ...context, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return context;
}

export async function requireApiRole(roles: string[]) {
  const context = await requireApiAuth();
  if (context.response) return context;
  if (!roles.includes(context.profile?.role)) {
    return { ...context, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return context;
}

export async function jsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
