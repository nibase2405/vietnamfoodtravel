import { createClient } from "@/lib/supabase/server";
import { attractions, destinations, guides, kols, medicalClinics, restaurants, services, tours } from "@/lib/data/mock";
import { defaultCityGuideRecords, normalizeCityGuideRecords } from "@/lib/city-guide-records";
import { enrichKOL, normalizeKOLs } from "@/lib/kols";
import { normalizeRankingSettings } from "@/lib/ranking-settings";

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

async function tableData(table: string, fallback: Record<string, unknown>[] = [], order = "created_at") {
  if (!hasSupabaseEnv()) return fallback;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from(table).select("*").order(order, { ascending: false });
    if (error) return fallback;
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getAdminUsersData() {
  return tableData("users", []);
}

export async function getAdminToursData() {
  return tableData("tours", tours as unknown as Record<string, unknown>[]);
}

export async function getAdminDestinationsData() {
  return tableData("destinations", destinations as unknown as Record<string, unknown>[], "sort_order");
}

export async function getAdminGuidesData() {
  return tableData("guides", guides as unknown as Record<string, unknown>[]);
}

export async function getAdminServicesData() {
  return tableData("services", services as unknown as Record<string, unknown>[], "sort_order");
}

export async function getAdminMedicalClinicsData() {
  return tableData("medical_clinics", medicalClinics as unknown as Record<string, unknown>[], "sort_order");
}

export async function getAdminKOLsData() {
  if (!hasSupabaseEnv()) return kols as unknown as Record<string, unknown>[];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("kols")
      .select("*, kol_visits(*)")
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true });
    if (error) return kols as unknown as Record<string, unknown>[];
    const normalized = normalizeKOLs(data).map(enrichKOL);
    return normalized.length ? normalized as unknown as Record<string, unknown>[] : kols as unknown as Record<string, unknown>[];
  } catch {
    return kols as unknown as Record<string, unknown>[];
  }
}

export async function getAdminRestaurantsData() {
  return tableData("restaurants", restaurants as unknown as Record<string, unknown>[]);
}

export async function getAdminRestaurantClaimsData() {
  return tableData("restaurant_claims", []);
}

export async function getAdminAttractionsData() {
  return tableData("attractions", attractions as unknown as Record<string, unknown>[]);
}

export async function getAdminBookingsData() {
  return tableData("bookings", []);
}

export async function getAdminPaymentsData() {
  return tableData("payments", []);
}

export async function getAdminAdsData() {
  return tableData("ad_campaigns", []);
}

export async function getAdminBlogPostsData() {
  return tableData("blog_posts", []);
}

export async function getAdminReviewsData() {
  return tableData("reviews", []);
}

export async function getAdminCustomTripRequestsData() {
  return tableData("custom_trip_requests", []);
}

export async function getAdminCustomTripProposalsData() {
  return tableData("custom_trip_proposals", []);
}

export async function getAdminSiteSettingValue(key: string) {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle();
    if (error) return null;
    return data?.value ?? null;
  } catch {
    return null;
  }
}

export async function getAdminCityGuideOverridesData() {
  return getAdminCityGuidesData();
}

export async function getAdminRankingSettingsData() {
  return getAdminRankingConfigsData();
}

export async function getAdminCityGuidesData() {
  if (!hasSupabaseEnv()) return defaultCityGuideRecords();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("city_guides")
      .select("*, city_guide_translations(*)")
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true });
    if (error) return defaultCityGuideRecords();
    const records = normalizeCityGuideRecords(data);
    return records.length ? records : defaultCityGuideRecords();
  } catch {
    return defaultCityGuideRecords();
  }
}

export async function getAdminRankingConfigsData() {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("ranking_configs").select("*").order("sort_order", { ascending: true });
    if (error) return [];
    return normalizeRankingSettings(data);
  } catch {
    return [];
  }
}

export async function getAdminStatsData() {
  if (!hasSupabaseEnv()) {
    return {
      todayBookings: 0,
      todayGmv: 0,
      monthGmv: 0,
      newUsers: 0,
      newRequests: 0,
      pendingGuides: 0,
      pendingClaims: 0,
      adImpressions: 0,
      adClicks: 0
    };
  }
  try {
    const supabase = await createClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const month = new Date(today.getFullYear(), today.getMonth(), 1);
    const [bookings, monthBookings, users, requests, pendingGuides, pendingClaims, impressions, clicks] = await Promise.all([
      supabase.from("bookings").select("id,total_amount").gte("created_at", today.toISOString()),
      supabase.from("bookings").select("id,total_amount").gte("created_at", month.toISOString()),
      supabase.from("users").select("id").gte("created_at", today.toISOString()),
      supabase.from("custom_trip_requests").select("id").eq("status", "new"),
      supabase.from("guides").select("id").eq("status", "pending"),
      supabase.from("restaurant_claims").select("id").eq("status", "pending"),
      supabase.from("ad_impressions").select("id"),
      supabase.from("ad_clicks").select("id")
    ]);
    return {
      todayBookings: bookings.data?.length ?? 0,
      todayGmv: bookings.data?.reduce((sum, row) => sum + Number(row.total_amount ?? 0), 0) ?? 0,
      monthGmv: monthBookings.data?.reduce((sum, row) => sum + Number(row.total_amount ?? 0), 0) ?? 0,
      newUsers: users.data?.length ?? 0,
      newRequests: requests.data?.length ?? 0,
      pendingGuides: pendingGuides.data?.length ?? 0,
      pendingClaims: pendingClaims.data?.length ?? 0,
      adImpressions: impressions.data?.length ?? 0,
      adClicks: clicks.data?.length ?? 0
    };
  } catch {
    return {
      todayBookings: 0,
      todayGmv: 0,
      monthGmv: 0,
      newUsers: 0,
      newRequests: 0,
      pendingGuides: 0,
      pendingClaims: 0,
      adImpressions: 0,
      adClicks: 0
    };
  }
}
