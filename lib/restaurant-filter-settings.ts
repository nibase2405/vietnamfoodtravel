export const RESTAURANT_FILTER_SETTINGS_STORAGE_KEY = "vietfood:restaurant-filter-settings:v1";

export type RestaurantFilterOption = {
  label: string;
  value: string;
};

export type RestaurantQuickFilter = {
  label: string;
  params: Record<string, string>;
};

export type RestaurantFilterGroupKey = "city" | "district" | "cuisine" | "price_range" | "min_rating" | "features" | "open" | "featured" | "sort";

export type RestaurantFilterSettings = {
  quickFilters: RestaurantQuickFilter[];
  groups: Record<RestaurantFilterGroupKey, RestaurantFilterOption[]>;
};

export type RestaurantFilterSettingsResponse = RestaurantFilterSettings & {
  source?: "database" | "default";
};

export const restaurantFilterGroupLabels: Record<RestaurantFilterGroupKey, string> = {
  city: "城市",
  district: "區域",
  cuisine: "料理類型",
  price_range: "價格區間",
  min_rating: "最低評分",
  features: "設施與語言",
  open: "營業狀態",
  featured: "精選狀態",
  sort: "熱門排序"
};

export const restaurantFilterGroupKeys = Object.keys(restaurantFilterGroupLabels) as RestaurantFilterGroupKey[];

export const defaultRestaurantFilterSettings: RestaurantFilterSettings = {
  quickFilters: [
    { label: "現在營業中", params: { open: "true" } },
    { label: "高評分 4.5+", params: { min_rating: "4.5" } },
    { label: "平價美食", params: { price_range: "low" } },
    { label: "胡志明市", params: { city: "Ho Chi Minh City" } },
    { label: "河內老城", params: { city: "Hanoi", district: "Old Quarter" } },
    { label: "峴港海鮮", params: { city: "Da Nang", cuisine: "Seafood" } },
    { label: "精選餐廳", params: { featured: "true" } },
    { label: "米其林餐廳", params: { features: "Michelin" } },
    { label: "預定最多", params: { sort: "most_booked" } },
    { label: "在地人預定最多", params: { sort: "local_most_booked" } },
    { label: "瀏覽最多", params: { sort: "most_viewed" } },
    { label: "英文菜單", params: { features: "English menu" } }
  ],
  groups: {
    city: [
      { value: "", label: "全部城市" },
      { value: "Ho Chi Minh City", label: "胡志明市" },
      { value: "Hanoi", label: "河內" },
      { value: "Da Nang", label: "峴港" },
      { value: "Hoi An", label: "會安" }
    ],
    district: [
      { value: "", label: "全部區域" },
      { value: "District 1", label: "胡志明市第 1 郡" },
      { value: "District 7", label: "胡志明市第 7 郡" },
      { value: "Old Quarter", label: "河內老城區" },
      { value: "Hoan Kiem", label: "還劍湖" },
      { value: "Son Tra", label: "山茶半島" },
      { value: "Hoi An Ancient Town", label: "會安古城" }
    ],
    cuisine: [
      { value: "", label: "全部料理" },
      { value: "越南料理", label: "越南料理" },
      { value: "越南河粉", label: "越南河粉" },
      { value: "越南法國麵包", label: "越南法國麵包" },
      { value: "Coffee", label: "咖啡廳" },
      { value: "Seafood", label: "海鮮" },
      { value: "Hotpot", label: "火鍋" },
      { value: "BBQ", label: "燒烤" },
      { value: "Vegetarian", label: "素食" },
      { value: "Korean", label: "韓國料理" },
      { value: "Japanese", label: "日本料理" },
      { value: "Chinese", label: "中式料理" }
    ],
    price_range: [
      { value: "", label: "全部價格" },
      { value: "low", label: "$ 平價" },
      { value: "medium", label: "$$ 中價位" },
      { value: "high", label: "$$$ 高價位" },
      { value: "luxury", label: "$$$$ 高級餐廳" }
    ],
    min_rating: [
      { value: "", label: "不限評分" },
      { value: "4.5", label: "4.5 星以上" },
      { value: "4.0", label: "4.0 星以上" },
      { value: "3.5", label: "3.5 星以上" }
    ],
    features: [
      { value: "", label: "全部設施" },
      { value: "Michelin", label: "米其林餐廳" },
      { value: "English menu", label: "英文菜單" },
      { value: "中文菜單", label: "中文菜單" },
      { value: "可刷卡", label: "可刷卡" },
      { value: "有冷氣", label: "有冷氣" },
      { value: "可預約", label: "可預約" },
      { value: "適合家庭", label: "適合家庭" },
      { value: "適合聚餐", label: "適合聚餐" }
    ],
    open: [
      { value: "", label: "不限營業狀態" },
      { value: "true", label: "現在營業中" },
      { value: "false", label: "目前休息中" }
    ],
    featured: [
      { value: "", label: "全部餐廳" },
      { value: "true", label: "只看精選餐廳" }
    ],
    sort: [
      { value: "", label: "預設排序" },
      { value: "most_booked", label: "預定最多" },
      { value: "local_most_booked", label: "在地人預定最多" },
      { value: "most_viewed", label: "瀏覽最多" }
    ]
  }
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function normalizeOption(value: unknown): RestaurantFilterOption | null {
  const row = asRecord(value);
  const label = String(row.label ?? "").trim();
  const optionValue = String(row.value ?? "").trim();
  if (!label && !optionValue) return null;
  return { label: label || optionValue || "未命名選項", value: optionValue };
}

function normalizeQuickFilter(value: unknown): RestaurantQuickFilter | null {
  const row = asRecord(value);
  const label = String(row.label ?? "").trim();
  const params = asRecord(row.params);
  const normalizedParams = Object.fromEntries(
    Object.entries(params)
      .map(([key, item]) => [key, String(item ?? "").trim()])
      .filter(([key, item]) => key && item)
  );
  if (!label || !Object.keys(normalizedParams).length) return null;
  return { label, params: normalizedParams };
}

function hasSameParams(a: Record<string, string>, b: Record<string, string>) {
  const aEntries = Object.entries(a);
  const bEntries = Object.entries(b);
  return aEntries.length === bEntries.length && aEntries.every(([key, value]) => b[key] === value);
}

export function normalizeRestaurantFilterSettings(value: unknown): RestaurantFilterSettings {
  const row = asRecord(value);
  const groups = asRecord(row.groups);
  const quickFilters = (Array.isArray(row.quickFilters) ? row.quickFilters : [])
    .map(normalizeQuickFilter)
    .filter((item): item is RestaurantQuickFilter => Boolean(item))
    .slice(0, 24);
  const mergedQuickFilters = [...quickFilters];
  defaultRestaurantFilterSettings.quickFilters
    .filter((filter) => Boolean(filter.params.sort) || filter.params.features === "Michelin")
    .forEach((filter) => {
      if (!mergedQuickFilters.some((item) => hasSameParams(item.params, filter.params))) {
        mergedQuickFilters.push(filter);
      }
    });

  return {
    quickFilters: (mergedQuickFilters.length ? mergedQuickFilters : defaultRestaurantFilterSettings.quickFilters).slice(0, 24),
    groups: Object.fromEntries(
      restaurantFilterGroupKeys.map((key) => {
        const options = (Array.isArray(groups[key]) ? groups[key] : [])
          .map(normalizeOption)
          .filter((item): item is RestaurantFilterOption => Boolean(item));
        return [key, options.length ? options : defaultRestaurantFilterSettings.groups[key]];
      })
    ) as Record<RestaurantFilterGroupKey, RestaurantFilterOption[]>
  };
}

export function paramsToQuery(params: Record<string, string>) {
  return new URLSearchParams(params).toString();
}

export function queryToParams(query: string) {
  return Object.fromEntries(new URLSearchParams(query.replace(/^\?/, "")).entries());
}
