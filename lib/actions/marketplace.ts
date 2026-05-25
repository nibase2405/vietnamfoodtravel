"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireAuth, requireGuide, requireMerchant } from "@/lib/actions/auth";

export async function getGuides() {
  const supabase = await createClient();
  return supabase.from("guides").select("*").eq("status", "approved").order("rating_avg", { ascending: false });
}

export async function getGuideById(id: string) {
  const supabase = await createClient();
  return supabase.from("guides").select("*, guide_services(*), guide_availability(*)").eq("id", id).single();
}

export async function applyGuide(payload: Record<string, unknown>) {
  await requireAuth();
  const supabase = await createClient();
  return supabase.from("guides").insert({ ...payload, status: "pending" }).select().single();
}

export async function approveGuide(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from("guides").update({ status: "approved", verified_at: new Date().toISOString() }).eq("id", id);
}

export async function rejectGuide(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from("guides").update({ status: "rejected" }).eq("id", id);
}

export async function suspendGuide(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  return supabase.from("guides").update({ status: "suspended" }).eq("id", id);
}

export async function updateGuideProfile(id: string, payload: Record<string, unknown>) {
  await requireGuide();
  const supabase = await createClient();
  return supabase.from("guides").update(payload).eq("id", id).select().single();
}

export async function updateGuideAvailability(id: string, payload: Record<string, unknown>) {
  await requireGuide();
  const supabase = await createClient();
  return supabase.from("guide_availability").update(payload).eq("id", id).select().single();
}

export async function createGuideService(payload: Record<string, unknown>) {
  await requireGuide();
  const supabase = await createClient();
  return supabase.from("guide_services").insert(payload).select().single();
}

export async function updateGuideService(id: string, payload: Record<string, unknown>) {
  await requireGuide();
  const supabase = await createClient();
  return supabase.from("guide_services").update(payload).eq("id", id).select().single();
}

export async function deleteGuideService(id: string) {
  await requireGuide();
  const supabase = await createClient();
  return supabase.from("guide_services").delete().eq("id", id);
}

export async function createAdCampaign(payload: Record<string, unknown>) {
  await requireMerchant();
  const supabase = await createClient();
  return supabase.from("ad_campaigns").insert(payload).select().single();
}

export async function updateAdCampaign(id: string, payload: Record<string, unknown>) {
  await requireMerchant();
  const supabase = await createClient();
  return supabase.from("ad_campaigns").update(payload).eq("id", id).select().single();
}

export async function trackAdImpression(payload: Record<string, unknown>) {
  const supabase = await createClient();
  return supabase.from("ad_impressions").insert(payload);
}

export async function trackAdClick(payload: Record<string, unknown>) {
  const supabase = await createClient();
  return supabase.from("ad_clicks").insert(payload);
}
