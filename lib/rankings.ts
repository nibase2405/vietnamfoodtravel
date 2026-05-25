import type { Restaurant } from "@/types";

export type RankingGroup = {
  id: string;
  title: string;
  description: string;
  restaurants: Restaurant[];
  ranking_key?: string;
  city?: string;
  category?: string;
  language_code?: string;
  sponsored_mode?: string;
  enabled?: boolean;
  sort_order?: number;
};

function metric(restaurant: Restaurant, key: "booking_count" | "local_booking_count" | "view_count") {
  return Number(restaurant[key] ?? 0);
}

function byScore(restaurants: Restaurant[], score: (restaurant: Restaurant) => number, limit = 6) {
  return restaurants.slice().sort((a, b) => score(b) - score(a)).slice(0, limit);
}

function hasFeature(restaurant: Restaurant, keyword: string) {
  return restaurant.features?.some((feature) => feature.toLowerCase().includes(keyword.toLowerCase())) ?? false;
}

function restaurantScore(restaurant: Restaurant) {
  return Number(restaurant.rating_avg ?? 0) * 100 +
    Number(restaurant.review_count ?? 0) / 10 +
    Number(restaurant.view_count ?? 0) / 100 +
    Number(restaurant.booking_count ?? 0);
}

function textHash(text: string) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function rankingIdForCuisine(cuisine: string) {
  const ascii = cuisine
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `cuisine-${ascii || textHash(cuisine)}`;
}

const cuisinePriority = [
  "越南料理",
  "越南河粉",
  "越南法國麵包",
  "海鮮",
  "咖啡廳",
  "甜點",
  "燒烤",
  "火鍋",
  "韓國料理",
  "日本料理",
  "中式料理",
  "台灣料理",
  "素食"
];

const nonCuisineTags = new Set(["早餐", "宵夜", "聚餐", "河內老店", "峴港", "會安"]);

function cuisineRankScore(cuisine: string, restaurants: Restaurant[]) {
  const priority = cuisinePriority.indexOf(cuisine);
  const priorityScore = priority === -1 ? 0 : (cuisinePriority.length - priority) * 1000;
  return priorityScore + restaurants.length * 100 + restaurants.reduce((sum, restaurant) => sum + restaurantScore(restaurant), 0) / Math.max(restaurants.length, 1);
}

function buildCuisineRankingGroups(restaurants: Restaurant[]): RankingGroup[] {
  const byCuisine = new Map<string, Restaurant[]>();

  restaurants.forEach((restaurant) => {
    (restaurant.cuisine_type ?? [])
      .map((cuisine) => cuisine.trim())
      .filter((cuisine) => cuisine && !nonCuisineTags.has(cuisine))
      .forEach((cuisine) => {
        const list = byCuisine.get(cuisine) ?? [];
        list.push(restaurant);
        byCuisine.set(cuisine, list);
      });
  });

  return Array.from(byCuisine.entries())
    .sort(([cuisineA, restaurantsA], [cuisineB, restaurantsB]) => cuisineRankScore(cuisineB, restaurantsB) - cuisineRankScore(cuisineA, restaurantsA))
    .slice(0, 12)
    .map(([cuisine, cuisineRestaurants]) => ({
      id: rankingIdForCuisine(cuisine),
      ranking_key: "most-viewed",
      title: `${cuisine}餐廳排行榜`,
      description: `依評分、評論與近期熱度整理 ${cuisine} 推薦餐廳，適合直接切換到美食地圖查看同菜系餐廳。`,
      category: cuisine,
      restaurants: byScore(cuisineRestaurants, restaurantScore, 6)
    }));
}

function buildCuisineOverviewGroup(cuisineGroups: RankingGroup[]): RankingGroup[] {
  const seen = new Set<string>();
  const restaurants = cuisineGroups
    .map((group) => group.restaurants[0])
    .filter((restaurant): restaurant is Restaurant => Boolean(restaurant))
    .filter((restaurant) => {
      if (seen.has(restaurant.id)) return false;
      seen.add(restaurant.id);
      return true;
    })
    .slice(0, 9);

  if (!restaurants.length) return [];

  return [
    {
      id: "cuisine-overview",
      ranking_key: "most-viewed",
      title: "不同料理餐廳排行榜",
      description: "整理各菜系中表現最好的代表餐廳，讓使用者快速比較越南料理、河粉、海鮮、咖啡廳與其他料理類型。",
      restaurants
    }
  ];
}

export function buildRankingGroups(restaurants: Restaurant[]): RankingGroup[] {
  const published = restaurants.filter((restaurant) => restaurant.status === "published" || restaurant.status === "claimed");
  const michelin = published.filter((restaurant) => hasFeature(restaurant, "Michelin") || hasFeature(restaurant, "米其林"));
  const cuisineGroups = buildCuisineRankingGroups(published);

  const baseGroups: RankingGroup[] = [
    {
      id: "most-booked",
      title: "預訂最多",
      description: "依餐廳預訂量與評論量建立，適合快速找到最多旅客正在安排的熱門餐廳。",
      restaurants: byScore(published, (restaurant) => metric(restaurant, "booking_count") || Number(restaurant.review_count ?? 0))
    },
    {
      id: "local-most-booked",
      title: "在地人預訂最多",
      description: "以本地使用者預訂行為為主，適合找越南本地消費者常去的餐廳。",
      restaurants: byScore(published, (restaurant) => metric(restaurant, "local_booking_count") || Number(restaurant.review_count ?? 0) * 0.5)
    },
    {
      id: "most-viewed",
      title: "瀏覽最多",
      description: "依近期瀏覽熱度排序，適合查看目前最受關注的餐廳。",
      restaurants: byScore(published, (restaurant) => metric(restaurant, "view_count") || Number(restaurant.review_count ?? 0) * 10)
    },
    {
      id: "michelin",
      title: "米其林餐廳",
      description: "整合 Michelin、必比登與精選餐廳標籤，適合高信任度餐廳探索。",
      restaurants: byScore(michelin.length ? michelin : published, (restaurant) => Number(restaurant.rating_avg ?? 0) * 100 + Number(restaurant.review_count ?? 0), 6)
    },
    {
      id: "best-value",
      title: "高 CP 值",
      description: "綜合評分、評論量與價格帶，推薦預算友善又穩定的餐廳。",
      restaurants: byScore(published, (restaurant) => Number(restaurant.rating_avg ?? 0) * 100 + (restaurant.price_range === "low" ? 60 : 0) + Number(restaurant.review_count ?? 0) / 40)
    },
    {
      id: "date-family-business",
      title: "約會家庭商務",
      description: "依評分、瀏覽與精選狀態排序，適合約會、家庭聚餐與商務用餐。",
      restaurants: byScore(published, (restaurant) => Number(restaurant.rating_avg ?? 0) * 80 + Number(restaurant.view_count ?? 0) / 500 + (restaurant.is_featured ? 30 : 0))
    }
  ];

  return [...baseGroups, ...buildCuisineOverviewGroup(cuisineGroups), ...cuisineGroups];
}
