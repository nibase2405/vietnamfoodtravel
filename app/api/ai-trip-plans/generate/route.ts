import { NextResponse } from "next/server";
import { jsonBody } from "@/lib/api/guards";
import { attractions, destinations, restaurants, services } from "@/lib/data/mock";
import { optimizeRoute } from "@/lib/geo/route-optimization";
import type { Attraction, Restaurant, Service } from "@/types";

const slotConfig: Record<string, Record<string, { label: string; time: string }>> = {
  "zh-tw": {
    breakfast: { label: "早餐", time: "08:30" },
    lunch: { label: "午餐", time: "12:30" },
    tea: { label: "下午茶", time: "15:30" },
    dinner: { label: "晚餐", time: "18:30" },
    night: { label: "宵夜", time: "21:30" }
  },
  "zh-cn": {
    breakfast: { label: "早餐", time: "08:30" },
    lunch: { label: "午餐", time: "12:30" },
    tea: { label: "下午茶", time: "15:30" },
    dinner: { label: "晚餐", time: "18:30" },
    night: { label: "宵夜", time: "21:30" }
  },
  en: {
    breakfast: { label: "Breakfast", time: "08:30" },
    lunch: { label: "Lunch", time: "12:30" },
    tea: { label: "Cafe break", time: "15:30" },
    dinner: { label: "Dinner", time: "18:30" },
    night: { label: "Late night", time: "21:30" }
  },
  vi: {
    breakfast: { label: "Bữa sáng", time: "08:30" },
    lunch: { label: "Bữa trưa", time: "12:30" },
    tea: { label: "Cà phê", time: "15:30" },
    dinner: { label: "Bữa tối", time: "18:30" },
    night: { label: "Ăn khuya", time: "21:30" }
  },
  ko: {
    breakfast: { label: "아침", time: "08:30" },
    lunch: { label: "점심", time: "12:30" },
    tea: { label: "카페", time: "15:30" },
    dinner: { label: "저녁", time: "18:30" },
    night: { label: "야식", time: "21:30" }
  },
  ja: {
    breakfast: { label: "朝食", time: "08:30" },
    lunch: { label: "昼食", time: "12:30" },
    tea: { label: "カフェ", time: "15:30" },
    dinner: { label: "夕食", time: "18:30" },
    night: { label: "夜食", time: "21:30" }
  }
};

const priceLevelBudget: Record<string, number> = {
  low: 90000,
  medium: 280000,
  high: 650000,
  luxury: 1200000
};

type PlanItem = {
  item_type: "restaurant" | "attraction";
  time: string;
  slot: string;
  slot_key?: string;
  title: string;
  restaurant_id?: string;
  restaurant_slug?: string;
  attraction_id?: string;
  attraction_slug?: string;
  location: string;
  note?: string;
  reason?: string;
  recommended_dishes?: string[];
  estimated_price?: number;
  price_hint?: string;
  travel_time_minutes?: number;
  distance_from_previous_km?: number;
  cuisine?: string[];
  latitude?: number | null;
  longitude?: number | null;
};

function normalizeLocale(value: unknown) {
  const locale = String(value ?? "zh-tw").toLowerCase();
  return Object.keys(slotConfig).includes(locale) ? locale : "zh-tw";
}

function normalizeArray(value: unknown, fallback: string[]) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  const text = String(value ?? "").trim();
  return text ? text.split(",").map((item) => item.trim()).filter(Boolean) : fallback;
}

function listText(values: unknown) {
  return Array.isArray(values) ? values.join(" ") : String(values ?? "");
}

function textMatches(value: unknown, keyword: string) {
  return String(value ?? "").toLowerCase().includes(keyword.toLowerCase());
}

function restaurantText(restaurant: Restaurant) {
  return [
    restaurant.name,
    restaurant.description,
    listText(restaurant.cuisine_type),
    listText(restaurant.recommended_dishes),
    listText(restaurant.features),
    listText(restaurant.languages)
  ].join(" ");
}

function attractionText(attraction: Attraction) {
  return [attraction.name, attraction.address, listText(attraction.category)].join(" ");
}

function serviceText(service: Service) {
  return [service.title, service.description, service.category, listText(service.tags)].join(" ");
}

function estimateSpend(restaurant: Restaurant) {
  if (restaurant.price_min && restaurant.price_max) return Math.round((restaurant.price_min + restaurant.price_max) / 2);
  if (restaurant.price_min) return restaurant.price_min;
  return priceLevelBudget[restaurant.price_range ?? "medium"] ?? priceLevelBudget.medium;
}

function scoreRestaurant(restaurant: Restaurant, prompt: Record<string, unknown>) {
  const interestWords = `${String(prompt.interests ?? "")} ${String(prompt.style ?? "")}`
    .split(/[,\s/]+/)
    .filter((word) => word.length > 1);
  const mustHaves = normalizeArray(prompt.must_haves, []);
  const text = restaurantText(restaurant);
  let score = Number(restaurant.rating_avg ?? 0) * 12 + Number(restaurant.review_count ?? 0) / 220;
  score += restaurant.is_featured ? 12 : 0;
  score += restaurant.is_open ? 8 : 0;

  interestWords.forEach((word) => {
    if (textMatches(text, word)) score += 8;
  });
  mustHaves.forEach((word) => {
    if (textMatches(text, word)) score += 6;
  });
  if (String(prompt.budget_priority ?? "") === "true" && restaurant.price_range === "low") score += 8;
  return score;
}

function scoreText(text: string, prompt: Record<string, unknown>) {
  const interestWords = `${String(prompt.interests ?? "")} ${String(prompt.style ?? "")}`
    .split(/[,\s/]+/)
    .filter((word) => word.length > 1);
  return interestWords.reduce((score, word) => score + (textMatches(text, word) ? 8 : 0), 0);
}

function isAvoided(restaurant: Restaurant, avoid: string) {
  if (!avoid) return false;
  const text = restaurantText(restaurant).toLowerCase();
  return avoid
    .split(/[,\s/]+/)
    .filter((word) => word.length > 1)
    .some((word) => text.includes(word));
}

function formatMoney(value: number, currency: string) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} ${currency}`;
}

function buildPlan(prompt: Record<string, unknown>) {
  const locale = normalizeLocale(prompt.locale);
  const slotLabels = slotConfig[locale];
  const destination = String(prompt.destination || "Ho Chi Minh City");
  const days = Math.max(1, Math.min(Number(prompt.days || 1), 5));
  const budget = Number(prompt.budget || 1200000);
  const currency = String(prompt.currency || "VND");
  const style = String(prompt.style || "local food");
  const transport = String(prompt.transport || "Grab + walk");
  const people = Math.max(1, Math.min(Number(prompt.people || 2), 12));
  const avoid = String(prompt.avoid || "").toLowerCase();
  const selectedSlots = normalizeArray(prompt.meal_slots, ["breakfast", "lunch", "tea", "dinner"]).filter((slot) => slotLabels[slot]);
  const slots = selectedSlots.length ? selectedSlots : ["breakfast", "lunch", "tea", "dinner"];
  const destinationRecord = destinations.find((item) => {
    const city = item.city.toLowerCase();
    const target = destination.toLowerCase();
    return city.includes(target) || target.includes(city) || item.slug.includes(target.replace(/\s+/g, "-"));
  });

  const cityRestaurants = restaurants.filter((restaurant) => {
    const city = restaurant.destinations?.city.toLowerCase() ?? "";
    const target = destination.toLowerCase();
    return city.includes(target) || target.includes(city) || restaurant.destination_id === destinationRecord?.id;
  });
  const cityAttractions = attractions.filter((attraction) => {
    const city = attraction.destinations?.city.toLowerCase() ?? "";
    const target = destination.toLowerCase();
    return city.includes(target) || target.includes(city) || attraction.destination_id === destinationRecord?.id;
  });
  const cityServices = services.filter((service) => {
    const serviceCity = service.city?.toLowerCase() ?? "";
    const target = destination.toLowerCase();
    return !serviceCity || serviceCity.includes(target) || target.includes(serviceCity);
  });
  const baseCandidates = cityRestaurants.length ? cityRestaurants : restaurants;
  const attractionCandidates = (cityAttractions.length ? cityAttractions : attractions)
    .slice()
    .sort((a, b) => Number(b.rating_avg ?? 0) * 10 + scoreText(attractionText(b), prompt) - (Number(a.rating_avg ?? 0) * 10 + scoreText(attractionText(a), prompt)));
  const serviceCandidates = (cityServices.length ? cityServices : services)
    .slice()
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || scoreText(serviceText(b), prompt) - scoreText(serviceText(a), prompt) || Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));
  const candidates = baseCandidates
    .filter((restaurant) => !isAvoided(restaurant, avoid))
    .slice()
    .sort((a, b) => scoreRestaurant(b, prompt) - scoreRestaurant(a, prompt));
  const routeCandidates = candidates.length ? candidates : baseCandidates;
  const dayPlans = [];
  let totalEstimatedBudget = 0;
  const mapPoints: Array<{ title: string; latitude: number; longitude: number; restaurant_slug?: string; attraction_slug?: string; item_type?: "restaurant" | "attraction" }> = [];

  for (let dayIndex = 0; dayIndex < days; dayIndex += 1) {
    const dayRestaurants = Array.from({ length: slots.length }, (_, slotIndex) => routeCandidates[(dayIndex * slots.length + slotIndex) % routeCandidates.length])
      .filter(Boolean);
    const optimized = optimizeRoute(dayRestaurants, {
      start: destinationRecord ? { id: destinationRecord.id, title: destinationRecord.city, latitude: destinationRecord.latitude, longitude: destinationRecord.longitude } : undefined,
      transport
    });

    const items: PlanItem[] = optimized.map((restaurant, index) => {
      const slotKey = slots[index] ?? slots[slots.length - 1];
      const slot = slotLabels[slotKey];
      const estimatedPrice = estimateSpend(restaurant) * people;
      totalEstimatedBudget += estimatedPrice;
      if (restaurant.latitude && restaurant.longitude) {
        mapPoints.push({
          title: restaurant.name,
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
          restaurant_slug: restaurant.slug,
          item_type: "restaurant"
        });
      }

      return {
        item_type: "restaurant",
        time: slot.time,
        slot: slot.label,
        slot_key: slotKey,
        title: restaurant.name,
        restaurant_id: restaurant.id,
        restaurant_slug: restaurant.slug,
        location: restaurant.address ?? restaurant.destinations?.city ?? destination,
        note: restaurant.recommended_dishes?.[0] ? `Recommended: ${restaurant.recommended_dishes[0]}` : restaurant.average_spend ?? undefined,
        reason: `${restaurant.cuisine_type?.slice(0, 2).join(" / ") || "Vietnam food"} · ${restaurant.rating_avg ?? "-"} stars · ${restaurant.is_open ? "Open now" : "Check hours"}`,
        recommended_dishes: restaurant.recommended_dishes?.slice(0, 3) ?? [],
        estimated_price: estimatedPrice,
        price_hint: restaurant.average_spend ?? `${formatMoney(estimateSpend(restaurant), currency)} / person`,
        travel_time_minutes: restaurant.travel_time_minutes,
        distance_from_previous_km: restaurant.distance_from_previous_km,
        cuisine: restaurant.cuisine_type?.slice(0, 3) ?? [],
        latitude: restaurant.latitude,
        longitude: restaurant.longitude
      };
    });

    const attraction = attractionCandidates[dayIndex % Math.max(attractionCandidates.length, 1)];
    if (attraction) {
      if (attraction.latitude && attraction.longitude) {
        mapPoints.push({
          title: attraction.name,
          latitude: attraction.latitude,
          longitude: attraction.longitude,
          attraction_slug: attraction.slug,
          item_type: "attraction"
        });
      }
      const attractionItem: PlanItem = {
        item_type: "attraction",
        time: slots.includes("tea") ? "16:30" : "10:30",
        slot: locale === "en" ? "Attraction stop" : "景點停留",
        slot_key: "attraction",
        title: attraction.name,
        attraction_id: attraction.id,
        attraction_slug: attraction.slug,
        location: attraction.address ?? attraction.destinations?.city ?? destination,
        note: locale === "en" ? "Use this as a walking break between meals." : "安排在兩餐之間，順路走訪附近景點。",
        reason: `${attraction.category?.slice(0, 2).join(" / ") || "Attraction"} · ${attraction.rating_avg ?? "-"} stars`,
        estimated_price: 0,
        price_hint: locale === "en" ? "Check ticket or local spending" : "依門票或現場消費",
        travel_time_minutes: 20,
        distance_from_previous_km: undefined,
        cuisine: [],
        latitude: attraction.latitude,
        longitude: attraction.longitude
      };
      const insertIndex = Math.min(2, Math.max(1, items.length));
      items.splice(insertIndex, 0, attractionItem);
    }

    dayPlans.push({
      day: dayIndex + 1,
      title: `Day ${dayIndex + 1} · ${destination}`,
      items
    });
  }

  return {
    prompt,
    generated_itinerary: {
      summary: `${destination} ${days}-day ${style} food itinerary for ${people} people, optimized for ${transport}.`,
      budget_note: `Requested budget: ${formatMoney(budget, currency)}. Estimated food spend: ${formatMoney(totalEstimatedBudget || budget, currency)}.`,
      route_note: "Stops are sorted with a nearest-neighbor route optimizer using restaurant coordinates. Confirm opening hours before departure.",
      days: dayPlans
    },
    map_points: mapPoints,
    suggested_services: serviceCandidates.slice(0, 3).map((service) => ({
      id: service.id,
      title: service.title,
      slug: service.slug,
      category: service.category,
      city: service.city,
      description: service.description,
      price_from: service.price_from,
      currency: service.currency,
      cta_label: service.cta_label,
      cta_href: service.cta_href
    })),
    estimated_budget: totalEstimatedBudget || budget,
    requested_budget: budget,
    currency
  };
}

export async function POST(request: Request) {
  const payload = await jsonBody(request);
  return NextResponse.json(buildPlan(payload));
}
