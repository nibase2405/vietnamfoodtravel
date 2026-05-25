const tourColumns = [
  "destination_id",
  "title",
  "slug",
  "tour_type",
  "theme",
  "duration_days",
  "duration_nights",
  "min_people",
  "max_people",
  "base_price",
  "currency",
  "cover_image_url",
  "gallery_urls",
  "status",
  "is_featured"
];

export function splitTourPayload(payload: Record<string, any>) {
  const tour = Object.fromEntries(Object.entries(payload).filter(([key]) => tourColumns.includes(key)));
  return {
    tour,
    prices: Array.isArray(payload.tour_prices) ? payload.tour_prices : [],
    itineraryDays: Array.isArray(payload.itinerary_days) ? payload.itinerary_days : [],
    inclusions: Array.isArray(payload.tour_inclusions) ? payload.tour_inclusions : []
  };
}

export async function replaceTourNested(supabase: any, tourId: string, payload: Record<string, any>) {
  const { prices, itineraryDays, inclusions } = splitTourPayload(payload);
  await Promise.all([
    supabase.from("tour_prices").delete().eq("tour_id", tourId),
    supabase.from("tour_itinerary_days").delete().eq("tour_id", tourId),
    supabase.from("tour_inclusions").delete().eq("tour_id", tourId)
  ]);
  return insertTourNested(supabase, tourId, { prices, itineraryDays, inclusions });
}

export async function insertTourNested(
  supabase: any,
  tourId: string,
  payload: { prices?: Record<string, any>[]; itineraryDays?: Record<string, any>[]; inclusions?: Record<string, any>[] }
) {
  const results = [];
  if (payload.prices?.length) {
    results.push(await supabase.from("tour_prices").insert(payload.prices.map((row) => ({ ...row, tour_id: tourId }))));
  }
  if (payload.itineraryDays?.length) {
    results.push(await supabase.from("tour_itinerary_days").insert(payload.itineraryDays.map((row) => ({ ...row, tour_id: tourId }))));
  }
  if (payload.inclusions?.length) {
    results.push(await supabase.from("tour_inclusions").insert(payload.inclusions.map((row) => ({ ...row, tour_id: tourId }))));
  }
  return results.find((result) => result.error)?.error ?? null;
}
