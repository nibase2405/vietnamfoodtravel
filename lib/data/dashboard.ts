import { createClient } from "@/lib/supabase/server";

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

async function currentUserId() {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

async function ownRows(table: string, userColumn = "user_id", fallback: Record<string, unknown>[] = []) {
  const userId = await currentUserId();
  if (!userId) return fallback;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from(table).select("*").eq(userColumn, userId).order("created_at", { ascending: false });
    if (error) return fallback;
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getUserDashboardStatsData() {
  const userId = await currentUserId();
  if (!userId) return { upcomingBookings: 0, favorites: 0, tripLists: 0, aiPlans: 0 };
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().slice(0, 10);
    const [bookings, favorites, tripLists, aiPlans] = await Promise.all([
      supabase.from("bookings").select("id").eq("user_id", userId).gte("travel_date", today),
      supabase.from("favorites").select("id").eq("user_id", userId),
      supabase.from("trip_lists").select("id").eq("user_id", userId),
      supabase.from("ai_trip_plans").select("id").eq("user_id", userId)
    ]);
    return {
      upcomingBookings: bookings.data?.length ?? 0,
      favorites: favorites.data?.length ?? 0,
      tripLists: tripLists.data?.length ?? 0,
      aiPlans: aiPlans.data?.length ?? 0
    };
  } catch {
    return { upcomingBookings: 0, favorites: 0, tripLists: 0, aiPlans: 0 };
  }
}

export async function getMyBookingsData() {
  return ownRows("bookings");
}

export async function getMyFavoritesData() {
  return ownRows("favorites");
}

export async function getMyTripListsData() {
  const userId = await currentUserId();
  if (!userId) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("trip_lists").select("*, trip_list_items(*)").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getMyAIPlansData() {
  return ownRows("ai_trip_plans");
}

export async function getMyProfileData() {
  const userId = await currentUserId();
  if (!userId) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("users").select("*, user_profiles(*)").eq("id", userId).single();
    return data;
  } catch {
    return null;
  }
}

export async function getGuideDashboardData() {
  const userId = await currentUserId();
  if (!userId) return { guide: null, services: [], availability: [], bookings: [], reviews: [] };
  try {
    const supabase = await createClient();
    const { data: guide } = await supabase.from("guides").select("*").eq("user_id", userId).maybeSingle();
    if (!guide) return { guide: null, services: [], availability: [], bookings: [], reviews: [] };
    const [services, availability, reviews] = await Promise.all([
      supabase.from("guide_services").select("*").eq("guide_id", guide.id),
      supabase.from("guide_availability").select("*").eq("guide_id", guide.id).order("available_date", { ascending: true }),
      supabase.from("reviews").select("*").eq("entity_type", "guide").eq("entity_id", guide.id).order("created_at", { ascending: false })
    ]);
    const serviceIds = services.data?.map((service) => service.id) ?? [];
    const guideBookings = serviceIds.length
      ? await supabase.from("bookings").select("*, guide_services(*)").in("guide_service_id", serviceIds).order("created_at", { ascending: false })
      : { data: [] };
    return {
      guide,
      services: services.data ?? [],
      availability: availability.data ?? [],
      bookings: guideBookings.data ?? [],
      reviews: reviews.data ?? []
    };
  } catch {
    return { guide: null, services: [], availability: [], bookings: [], reviews: [] };
  }
}

export async function getMerchantDashboardData() {
  const userId = await currentUserId();
  if (!userId) return { restaurants: [], claims: [], ads: [], impressions: 0, clicks: 0, ctr: "0%" };
  try {
    const supabase = await createClient();
    const [claims, ads] = await Promise.all([
      supabase.from("restaurant_claims").select("*, restaurants(*)").eq("merchant_user_id", userId).order("created_at", { ascending: false }),
      supabase.from("ad_campaigns").select("*").eq("merchant_user_id", userId).order("start_date", { ascending: false })
    ]);
    const campaignIds = ads.data?.map((ad) => ad.id) ?? [];
    const [impressions, clicks] = campaignIds.length
      ? await Promise.all([
          supabase.from("ad_impressions").select("id").in("campaign_id", campaignIds),
          supabase.from("ad_clicks").select("id").in("campaign_id", campaignIds)
        ])
      : [{ data: [] }, { data: [] }];
    const impressionCount = impressions.data?.length ?? 0;
    const clickCount = clicks.data?.length ?? 0;
    return {
      restaurants: claims.data?.filter((claim) => claim.status === "approved").map((claim) => claim.restaurants).filter(Boolean) ?? [],
      claims: claims.data ?? [],
      ads: ads.data ?? [],
      impressions: impressionCount,
      clicks: clickCount,
      ctr: impressionCount ? `${((clickCount / impressionCount) * 100).toFixed(2)}%` : "0%"
    };
  } catch {
    return { restaurants: [], claims: [], ads: [], impressions: 0, clicks: 0, ctr: "0%" };
  }
}
