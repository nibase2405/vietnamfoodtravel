"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Filter, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  defaultRestaurantFilterSettings,
  normalizeRestaurantFilterSettings,
  paramsToQuery,
  RESTAURANT_FILTER_SETTINGS_STORAGE_KEY,
  restaurantFilterGroupKeys,
  restaurantFilterGroupLabels,
  type RestaurantFilterGroupKey,
  type RestaurantFilterOption,
  type RestaurantQuickFilter,
  type RestaurantFilterSettingsResponse,
  type RestaurantFilterSettings
} from "@/lib/restaurant-filter-settings";
import type { SupportedLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { useCurrentLocale } from "@/lib/i18n/use-current-locale";
import { cn } from "@/lib/utils/cn";

type SearchParamsLike = Pick<URLSearchParams, "get" | "toString">;

export function FilterSidebar({
  title = "篩選條件",
  type = "generic",
  collapsible = false
}: {
  title?: string;
  type?: "tours" | "restaurants" | "attractions" | "guides" | "blog" | "generic";
  collapsible?: boolean;
}) {
  const locale = useCurrentLocale();
  const dict = getDictionary(locale);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryKey = searchParams.toString();
  const compact = type === "restaurants";
  const [expanded, setExpanded] = useState(!collapsible || Boolean(queryKey));

  useEffect(() => {
    if (collapsible && queryKey) setExpanded(true);
  }, [collapsible, queryKey]);

  return (
    <Card className={cn("p-4", compact && "p-3")}>
      <form key={queryKey} action={pathname} className={cn("grid gap-4", compact && "gap-3")}>
        <div className="flex items-center justify-between gap-3">
          <div className={cn("flex items-center gap-2 font-semibold", compact && "text-sm")}>
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            {title}
          </div>
          {collapsible ? (
            <Button type="button" variant="outline" size="sm" className="h-8 px-2.5 text-xs" onClick={() => setExpanded((current) => !current)}>
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {expanded ? dict.filters.collapse : dict.filters.more}
            </Button>
          ) : null}
        </div>
        {type === "tours" ? <TourFields searchParams={searchParams} /> : null}
        {type === "restaurants" ? <RestaurantFields searchParams={searchParams} pathname={pathname} showAdvanced={!collapsible || expanded} /> : null}
        {type === "attractions" ? <AttractionFields /> : null}
        {type === "guides" ? <GuideFields /> : null}
        {type === "blog" ? <BlogFields /> : null}
        {type === "generic" ? <GenericFields /> : null}
        {!collapsible || expanded ? (
          <Button type="submit" size={compact ? "sm" : "default"}>
            <Filter className="h-4 w-4" />
            {dict.filters.apply}
          </Button>
        ) : null}
        {queryKey ? (
          <Button asChild variant="ghost" size={compact ? "sm" : "default"}>
            <Link href={pathname}>
              <X className="h-4 w-4" />
              {dict.filters.clear}
            </Link>
          </Button>
        ) : null}
      </form>
    </Card>
  );
}

function TourFields({ searchParams }: { searchParams: SearchParamsLike }) {
  return (
    <>
      <Input name="destination" defaultValue={searchParams.get("destination") ?? ""} placeholder="城市，例如 Ho Chi Minh City" />
      <Input name="days" defaultValue={searchParams.get("days") ?? ""} placeholder="天數" type="number" />
      <Input name="max_price" defaultValue={searchParams.get("max_price") ?? ""} placeholder="最高價格，例如 300" type="number" />
      <Input name="theme" defaultValue={searchParams.get("theme") ?? ""} placeholder="主題，例如 美食 / 親子 / 文化" />
      <Input name="tour_type" defaultValue={searchParams.get("tour_type") ?? ""} placeholder="private / group / day_trip" />
    </>
  );
}

function RestaurantFields({ searchParams, pathname, showAdvanced = true }: { searchParams: SearchParamsLike; pathname: string; showAdvanced?: boolean }) {
  const locale = useCurrentLocale();
  const dict = getDictionary(locale);
  const [settings, setSettings] = useState<RestaurantFilterSettings>(defaultRestaurantFilterSettings);

  useEffect(() => {
    let hasLocalSettings = false;

    try {
      const saved = window.localStorage.getItem(RESTAURANT_FILTER_SETTINGS_STORAGE_KEY);
      hasLocalSettings = Boolean(saved);
      if (saved) setSettings(normalizeRestaurantFilterSettings(JSON.parse(saved)));
    } catch {
      setSettings(defaultRestaurantFilterSettings);
    }

    void fetch("/api/restaurant-filter-settings", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!data) return;
        const source = getSettingsSource(data);
        if (source !== "default" || !hasLocalSettings) {
          setSettings(normalizeRestaurantFilterSettings(data));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="grid gap-2">
        <div className="text-[11px] font-medium text-muted-foreground">{dict.filters.quickFilters}</div>
        <div className="flex flex-wrap gap-1.5">
          {settings.quickFilters.map((filter) => (
            <Link
              key={`${filter.label}-${paramsToQuery(filter.params)}`}
              href={`${pathname}?${paramsToQuery(filter.params)}`}
              className={cn(
                "rounded-full border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:border-primary hover:text-foreground",
                isActiveQuickFilter(searchParams, filter.params) && "border-primary bg-primary text-primary-foreground hover:text-primary-foreground"
              )}
            >
              {translateQuickFilter(locale, filter)}
            </Link>
          ))}
        </div>
      </div>

      {showAdvanced ? (
        <div className="grid gap-2">
          {restaurantFilterGroupKeys.map((key) => (
            <SelectField
              key={key}
              label={translateGroupLabel(locale, key)}
              name={key}
              defaultValue={searchParams.get(key) ?? ""}
              options={settings.groups[key].map((option) => [option.value, translateOption(locale, key, option)])}
              compact
            />
          ))}
        </div>
      ) : null}
    </>
  );
}

function getSettingsSource(data: unknown) {
  return data && typeof data === "object" && "source" in data
    ? (data as RestaurantFilterSettingsResponse).source
    : undefined;
}

function isActiveQuickFilter(searchParams: SearchParamsLike, params: Record<string, string>) {
  return Object.entries(params).every(([key, value]) => searchParams.get(key) === value);
}

const groupTranslations: Record<SupportedLocale, Partial<Record<RestaurantFilterGroupKey, string>>> = {
  "zh-tw": restaurantFilterGroupLabels,
  "zh-cn": { city: "城市", district: "区域", cuisine: "料理类型", price_range: "价格区间", min_rating: "最低评分", features: "设施与语言", open: "营业状态", featured: "精选状态", sort: "热门排序" },
  en: { city: "City", district: "Area", cuisine: "Cuisine", price_range: "Price", min_rating: "Rating", features: "Features & language", open: "Open status", featured: "Featured", sort: "Sort" },
  vi: { city: "Thành phố", district: "Khu vực", cuisine: "Ẩm thực", price_range: "Giá", min_rating: "Đánh giá", features: "Tiện ích & ngôn ngữ", open: "Trạng thái", featured: "Nổi bật", sort: "Sắp xếp" },
  ko: { city: "도시", district: "지역", cuisine: "음식 종류", price_range: "가격대", min_rating: "최소 평점", features: "시설 및 언어", open: "영업 상태", featured: "추천 상태", sort: "정렬" },
  ja: { city: "都市", district: "エリア", cuisine: "料理タイプ", price_range: "価格帯", min_rating: "最低評価", features: "設備・言語", open: "営業状態", featured: "おすすめ", sort: "並び替え" }
};

const optionTranslations: Record<SupportedLocale, Record<string, string>> = {
  "zh-tw": {},
  "zh-cn": {
    全部城市: "全部城市", 河內: "河内", 峴港: "岘港", 會安: "会安", 全部區域: "全部区域", "胡志明市第 1 郡": "胡志明市第 1 郡", "胡志明市第 7 郡": "胡志明市第 7 郡", 河內老城區: "河内老城区", 還劍湖: "还剑湖", 山茶半島: "山茶半岛", 會安古城: "会安古城", 全部料理: "全部料理", 越南料理: "越南料理", 越南法國麵包: "越南法棍", 咖啡廳: "咖啡厅", 海鮮: "海鲜", 火鍋: "火锅", 燒烤: "烧烤", 素食: "素食", 韓國料理: "韩国料理", 日本料理: "日本料理", 中式料理: "中式料理", 全部價格: "全部价格", "$ 平價": "$ 平价", "$$ 中價位": "$$ 中价位", "$$$ 高價位": "$$$ 高价位", "$$$$ 高級餐廳": "$$$$ 高级餐厅", 不限評分: "不限评分", "4.5 星以上": "4.5 星以上", "4.0 星以上": "4.0 星以上", "3.5 星以上": "3.5 星以上", 全部設施: "全部设施", 米其林餐廳: "米其林餐厅", 英文菜單: "英文菜单", 中文菜單: "中文菜单", 可刷卡: "可刷卡", 有冷氣: "有空调", 可預約: "可预约", 適合家庭: "适合家庭", 適合聚餐: "适合聚餐", 不限營業狀態: "不限营业状态", 現在營業中: "现在营业中", 目前休息中: "目前休息中", 全部餐廳: "全部餐厅", 只看精選餐廳: "只看精选餐厅", 預設排序: "默认排序", 預定最多: "预订最多", 在地人預定最多: "当地人预订最多", 瀏覽最多: "浏览最多"
  },
  en: {
    全部城市: "All cities", 胡志明市: "Ho Chi Minh City", 河內: "Hanoi", 峴港: "Da Nang", 會安: "Hoi An", 全部區域: "All areas", "胡志明市第 1 郡": "District 1", "胡志明市第 7 郡": "District 7", 河內老城區: "Hanoi Old Quarter", 還劍湖: "Hoan Kiem", 山茶半島: "Son Tra", 會安古城: "Hoi An Ancient Town", 全部料理: "All cuisines", 越南料理: "Vietnamese", 越南河粉: "Pho", 越南法國麵包: "Banh mi", 咖啡廳: "Cafe", 海鮮: "Seafood", 火鍋: "Hot pot", 燒烤: "BBQ", 素食: "Vegetarian", 韓國料理: "Korean", 日本料理: "Japanese", 中式料理: "Chinese", 全部價格: "All prices", "$ 平價": "$ Budget", "$$ 中價位": "$$ Mid-range", "$$$ 高價位": "$$$ Premium", "$$$$ 高級餐廳": "$$$$ Fine dining", 不限評分: "Any rating", "4.5 星以上": "4.5+ stars", "4.0 星以上": "4.0+ stars", "3.5 星以上": "3.5+ stars", 全部設施: "All features", 米其林餐廳: "Michelin restaurants", 英文菜單: "English menu", 中文菜單: "Chinese menu", 可刷卡: "Card accepted", 有冷氣: "Air-conditioned", 可預約: "Reservation", 適合家庭: "Family-friendly", 適合聚餐: "Good for groups", 不限營業狀態: "Any open status", 現在營業中: "Open now", 目前休息中: "Closed now", 全部餐廳: "All restaurants", 只看精選餐廳: "Featured only", 預設排序: "Default", 預定最多: "Most booked", 在地人預定最多: "Most booked by locals", 瀏覽最多: "Most viewed"
  },
  vi: {
    全部城市: "Tất cả thành phố", 胡志明市: "TP. Hồ Chí Minh", 河內: "Hà Nội", 峴港: "Đà Nẵng", 會安: "Hội An", 全部區域: "Tất cả khu vực", "胡志明市第 1 郡": "Quận 1", "胡志明市第 7 郡": "Quận 7", 河內老城區: "Phố cổ Hà Nội", 還劍湖: "Hoàn Kiếm", 山茶半島: "Sơn Trà", 會安古城: "Phố cổ Hội An", 全部料理: "Tất cả món", 越南料理: "Món Việt", 越南河粉: "Phở", 越南法國麵包: "Bánh mì", 咖啡廳: "Quán cà phê", 海鮮: "Hải sản", 火鍋: "Lẩu", 燒烤: "Nướng", 素食: "Chay", 韓國料理: "Món Hàn", 日本料理: "Món Nhật", 中式料理: "Món Hoa", 全部價格: "Tất cả giá", "$ 平價": "$ Bình dân", "$$ 中價位": "$$ Trung bình", "$$$ 高價位": "$$$ Cao cấp", "$$$$ 高級餐廳": "$$$$ Fine dining", 不限評分: "Mọi đánh giá", "4.5 星以上": "Từ 4.5 sao", "4.0 星以上": "Từ 4.0 sao", "3.5 星以上": "Từ 3.5 sao", 全部設施: "Tất cả tiện ích", 米其林餐廳: "Nhà hàng Michelin", 英文菜單: "Thực đơn tiếng Anh", 中文菜單: "Thực đơn tiếng Trung", 可刷卡: "Nhận thẻ", 有冷氣: "Có máy lạnh", 可預約: "Có đặt chỗ", 適合家庭: "Phù hợp gia đình", 適合聚餐: "Phù hợp nhóm", 不限營業狀態: "Mọi trạng thái", 現在營業中: "Đang mở cửa", 目前休息中: "Đang đóng cửa", 全部餐廳: "Tất cả nhà hàng", 只看精選餐廳: "Chỉ xem nổi bật", 預設排序: "Mặc định", 預定最多: "Đặt nhiều nhất", 在地人預定最多: "Người địa phương đặt nhiều", 瀏覽最多: "Xem nhiều nhất"
  },
  ko: {
    全部城市: "전체 도시", 胡志明市: "호치민", 河內: "하노이", 峴港: "다낭", 會安: "호이안", 全部區域: "전체 지역", "胡志明市第 1 郡": "호치민 1군", "胡志明市第 7 郡": "호치민 7군", 河內老城區: "하노이 올드쿼터", 還劍湖: "호안끼엠", 山茶半島: "선짜 반도", 會安古城: "호이안 올드타운", 全部料理: "전체 음식", 越南料理: "베트남 음식", 越南河粉: "쌀국수", 越南法國麵包: "반미", 咖啡廳: "카페", 海鮮: "해산물", 火鍋: "훠궈", 燒烤: "바비큐", 素食: "채식", 韓國料理: "한식", 日本料理: "일식", 中式料理: "중식", 全部價格: "전체 가격", "$ 平價": "$ 저렴", "$$ 中價位": "$$ 중간", "$$$ 高價位": "$$$ 프리미엄", "$$$$ 高級餐廳": "$$$$ 고급 식당", 不限評分: "평점 무관", "4.5 星以上": "4.5점 이상", "4.0 星以上": "4.0점 이상", "3.5 星以上": "3.5점 이상", 全部設施: "전체 시설", 米其林餐廳: "미쉐린 레스토랑", 英文菜單: "영어 메뉴", 中文菜單: "중국어 메뉴", 可刷卡: "카드 가능", 有冷氣: "에어컨 있음", 可預約: "예약 가능", 適合家庭: "가족 친화", 適合聚餐: "모임 적합", 不限營業狀態: "영업 상태 무관", 現在營業中: "지금 영업 중", 目前休息中: "현재 휴식 중", 全部餐廳: "전체 식당", 只看精選餐廳: "추천 식당만", 預設排序: "기본 정렬", 預定最多: "예약 많은 순", 在地人預定最多: "현지인 예약 많은 순", 瀏覽最多: "조회 많은 순"
  },
  ja: {
    全部城市: "すべての都市", 胡志明市: "ホーチミン", 河內: "ハノイ", 峴港: "ダナン", 會安: "ホイアン", 全部區域: "すべてのエリア", "胡志明市第 1 郡": "ホーチミン1区", "胡志明市第 7 郡": "ホーチミン7区", 河內老城區: "ハノイ旧市街", 還劍湖: "ホアンキエム", 山茶半島: "ソンチャ半島", 會安古城: "ホイアン旧市街", 全部料理: "すべての料理", 越南料理: "ベトナム料理", 越南河粉: "フォー", 越南法國麵包: "バインミー", 咖啡廳: "カフェ", 海鮮: "海鮮", 火鍋: "火鍋", 燒烤: "焼肉", 素食: "ベジタリアン", 韓國料理: "韓国料理", 日本料理: "日本料理", 中式料理: "中華料理", 全部價格: "すべての価格", "$ 平價": "$ 手頃", "$$ 中價位": "$$ 中価格", "$$$ 高價位": "$$$ 高級", "$$$$ 高級餐廳": "$$$$ ファインダイニング", 不限評分: "評価指定なし", "4.5 星以上": "4.5 星以上", "4.0 星以上": "4.0 星以上", "3.5 星以上": "3.5 星以上", 全部設施: "すべての設備", 米其林餐廳: "ミシュラン掲載店", 英文菜單: "英語メニュー", 中文菜單: "中国語メニュー", 可刷卡: "カード可", 有冷氣: "エアコンあり", 可預約: "予約可", 適合家庭: "家族向け", 適合聚餐: "グループ向け", 不限營業狀態: "営業状態指定なし", 現在營業中: "現在営業中", 目前休息中: "現在休業中", 全部餐廳: "すべてのレストラン", 只看精選餐廳: "おすすめのみ", 預設排序: "標準順", 預定最多: "予約が多い順", 在地人預定最多: "現地の人の予約が多い順", 瀏覽最多: "閲覧が多い順"
  }
};

function translateGroupLabel(locale: SupportedLocale, key: RestaurantFilterGroupKey) {
  return groupTranslations[locale][key] ?? restaurantFilterGroupLabels[key];
}

function translateOption(locale: SupportedLocale, _key: RestaurantFilterGroupKey, option: RestaurantFilterOption) {
  return optionTranslations[locale][option.label] ?? option.label;
}

function translateQuickFilter(locale: SupportedLocale, filter: RestaurantQuickFilter) {
  const query = paramsToQuery(filter.params);
  const quickTranslations: Record<SupportedLocale, Record<string, string>> = {
    "zh-tw": {},
    "zh-cn": { open: "现在营业中", min_rating: "高评分 4.5+", price_range: "平价美食", city_hcm: "胡志明市", hanoi_old: "河内老城", danang_seafood: "岘港海鲜", featured: "精选餐厅", michelin: "米其林餐厅", most_booked: "预订最多", local_most_booked: "当地人预订最多", most_viewed: "浏览最多", english_menu: "英文菜单" },
    en: { open: "Open now", min_rating: "Highly rated 4.5+", price_range: "Budget eats", city_hcm: "Ho Chi Minh City", hanoi_old: "Hanoi Old Quarter", danang_seafood: "Da Nang seafood", featured: "Featured restaurants", michelin: "Michelin restaurants", most_booked: "Most booked", local_most_booked: "Most booked by locals", most_viewed: "Most viewed", english_menu: "English menu" },
    vi: { open: "Đang mở cửa", min_rating: "Đánh giá cao 4.5+", price_range: "Món ngon bình dân", city_hcm: "TP. Hồ Chí Minh", hanoi_old: "Phố cổ Hà Nội", danang_seafood: "Hải sản Đà Nẵng", featured: "Nhà hàng nổi bật", michelin: "Nhà hàng Michelin", most_booked: "Đặt nhiều nhất", local_most_booked: "Người địa phương đặt nhiều", most_viewed: "Xem nhiều nhất", english_menu: "Thực đơn tiếng Anh" },
    ko: { open: "지금 영업 중", min_rating: "고평점 4.5+", price_range: "저렴한 맛집", city_hcm: "호치민", hanoi_old: "하노이 올드쿼터", danang_seafood: "다낭 해산물", featured: "추천 식당", michelin: "미쉐린 레스토랑", most_booked: "예약 많은 순", local_most_booked: "현지인 예약 많은 순", most_viewed: "조회 많은 순", english_menu: "영어 메뉴" },
    ja: { open: "現在営業中", min_rating: "高評価 4.5+", price_range: "手頃なグルメ", city_hcm: "ホーチミン", hanoi_old: "ハノイ旧市街", danang_seafood: "ダナン海鮮", featured: "おすすめレストラン", michelin: "ミシュラン掲載店", most_booked: "予約が多い", local_most_booked: "現地の人の予約が多い", most_viewed: "閲覧が多い", english_menu: "英語メニュー" }
  };
  const key =
    query === "open=true" ? "open" :
    query === "min_rating=4.5" ? "min_rating" :
    query === "price_range=low" ? "price_range" :
    query === "city=Ho+Chi+Minh+City" ? "city_hcm" :
    query === "city=Hanoi&district=Old+Quarter" ? "hanoi_old" :
    query === "city=Da+Nang&cuisine=Seafood" ? "danang_seafood" :
    query === "featured=true" ? "featured" :
    query === "features=Michelin" ? "michelin" :
    query === "sort=most_booked" ? "most_booked" :
    query === "sort=local_most_booked" ? "local_most_booked" :
    query === "sort=most_viewed" ? "most_viewed" :
    query === "features=English+menu" ? "english_menu" :
    "";
  return key ? quickTranslations[locale][key] ?? filter.label : filter.label;
}

function SelectField({ label, name, defaultValue, options, compact = false }: { label: string; name: string; defaultValue: string; options: string[][]; compact?: boolean }) {
  return (
    <label className={cn("grid gap-1.5 text-sm font-medium", compact && "gap-1 text-xs")}>
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className={cn(
          "h-10 rounded-md border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring",
          compact && "h-8 px-2.5 text-xs"
        )}
      >
        {options.map(([value, text]) => (
          <option key={`${name}-${value || "all"}`} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

function AttractionFields() {
  return (
    <>
      <Input name="city" placeholder="城市" />
      <Input name="category" placeholder="分類" />
    </>
  );
}

function GuideFields() {
  return (
    <>
      <Input name="city" placeholder="服務城市" />
      <Input name="language" placeholder="語言" />
      <Input name="specialty" placeholder="專長" />
      <Input name="max_rate" placeholder="最高時薪" type="number" />
    </>
  );
}

function BlogFields() {
  return (
    <>
      <Input name="category" placeholder="分類" />
      <Input name="tag" placeholder="標籤" />
    </>
  );
}

function GenericFields() {
  return (
    <>
      <Input name="city" placeholder="城市" />
      <Input name="q" placeholder="搜尋關鍵字" />
    </>
  );
}
