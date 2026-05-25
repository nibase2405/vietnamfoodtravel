"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Bot,
  CalendarDays,
  Check,
  CircleDollarSign,
  Clock,
  Copy,
  MapPin,
  Navigation,
  Route,
  Save,
  Sparkles,
  Utensils,
  Users,
  WalletCards
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AddToTripListButton } from "@/components/map/AddToTripListButton";
import { MapView } from "@/components/map/MapView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { localizeHref, type SupportedLocale } from "@/lib/i18n/config";
import { useCurrentLocale } from "@/lib/i18n/use-current-locale";

type GeneratedPlanItem = {
  item_type?: "restaurant" | "attraction";
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
  latitude?: number | null;
  longitude?: number | null;
};

type GeneratedPlan = {
  generated_itinerary: {
    summary?: string;
    budget_note?: string;
    route_note?: string;
    days?: { day: number; title: string; items: GeneratedPlanItem[] }[];
  };
  map_points: { title: string; latitude: number; longitude: number; restaurant_slug?: string; attraction_slug?: string; item_type?: "restaurant" | "attraction" }[];
  suggested_services?: Array<{
    id: string;
    title: string;
    slug: string;
    category?: string | null;
    city?: string | null;
    description?: string | null;
    price_from?: number | null;
    currency?: string | null;
    cta_label?: string | null;
    cta_href?: string | null;
  }>;
  estimated_budget: number;
  requested_budget?: number;
  currency: string;
};

type Preset = {
  label: string;
  destination: string;
  days: number;
  budget: number;
  style: string;
  interests: string;
  avoid: string;
  transport: string;
  mealSlots: string[];
  mustHaves: string[];
};

type PlannerText = {
  presets: Preset[];
  labels: {
    destination: string;
    days: string;
    date: string;
    people: string;
    budget: string;
    transport: string;
    style: string;
    currency: string;
    interests: string;
    avoid: string;
    meals: string;
    mustHave: string;
    generate: string;
    generating: string;
    result: string;
    optimized: string;
    copy: string;
    copied: string;
    save: string;
    openMaps: string;
    routeMap: string;
    routeNote: string;
    budgetNote: string;
    restaurantPage: string;
    attractionPage?: string;
    services?: string;
    servicePage?: string;
    directions: string;
    stops: string;
    dayCount: string;
    estimatedBudget: string;
    travelMode: string;
    minutes: string;
    km: string;
    saveOk: string;
    saveError: string;
    generateError: string;
  };
  mealOptions: Array<{ value: string; label: string }>;
  mustHaveOptions: string[];
};

const today = new Date().toISOString().slice(0, 10);
const selectClass = "h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

const plannerText: Record<SupportedLocale, PlannerText> = {
  "zh-tw": {
    presets: [
      { label: "胡志明一日經典", destination: "Ho Chi Minh City", days: 1, budget: 1200000, style: "在地經典", interests: "河粉、咖啡、法國麵包、在地小吃", avoid: "太辣", transport: "Grab + walk", mealSlots: ["breakfast", "lunch", "tea", "dinner"], mustHaves: ["English menu", "Local favorite"] },
      { label: "河內咖啡散步", destination: "Hanoi", days: 1, budget: 1000000, style: "老城散步", interests: "蛋咖啡、老街小吃、越南料理", avoid: "", transport: "walk + Grab", mealSlots: ["breakfast", "tea", "dinner"], mustHaves: ["English menu"] },
      { label: "峴港海鮮路線", destination: "Da Nang", days: 1, budget: 2200000, style: "海鮮與海邊", interests: "海鮮、咖啡、景點附近餐廳", avoid: "", transport: "Grab", mealSlots: ["lunch", "tea", "dinner"], mustHaves: ["Seafood", "Air conditioning"] }
    ],
    labels: {
      destination: "城市", days: "天數", date: "日期", people: "人數", budget: "預算", transport: "交通方式", style: "行程風格", currency: "幣別", interests: "想吃什麼", avoid: "避免項目", meals: "用餐時段", mustHave: "必要條件", generate: "產生 AI 美食行程", generating: "產生中...", result: "AI 行程已產生", optimized: "已依地理位置優化路線", copy: "複製行程", copied: "已複製", save: "儲存行程", openMaps: "Google Maps 路線", routeMap: "路線地圖", routeNote: "路線說明", budgetNote: "預算說明", restaurantPage: "餐廳頁", directions: "導航", stops: "站點", dayCount: "天數", estimatedBudget: "預估花費", travelMode: "交通", minutes: "分鐘", km: "公里", saveOk: "AI 行程已儲存。", saveError: "儲存行程失敗，請確認登入狀態。", generateError: "產生行程失敗，請稍後再試。"
    },
    mealOptions: [{ value: "breakfast", label: "早餐" }, { value: "lunch", label: "午餐" }, { value: "tea", label: "下午茶" }, { value: "dinner", label: "晚餐" }, { value: "night", label: "宵夜" }],
    mustHaveOptions: ["Air conditioning", "English menu", "Chinese menu", "Local favorite", "Michelin", "Seafood", "Family friendly"]
  },
  "zh-cn": {
    presets: [],
    labels: {
      destination: "城市", days: "天数", date: "日期", people: "人数", budget: "预算", transport: "交通方式", style: "行程风格", currency: "币别", interests: "想吃什么", avoid: "避免项目", meals: "用餐时段", mustHave: "必要条件", generate: "生成 AI 美食行程", generating: "生成中...", result: "AI 行程已生成", optimized: "已依地理位置优化路线", copy: "复制行程", copied: "已复制", save: "保存行程", openMaps: "Google Maps 路线", routeMap: "路线地图", routeNote: "路线说明", budgetNote: "预算说明", restaurantPage: "餐厅页", directions: "导航", stops: "站点", dayCount: "天数", estimatedBudget: "预估花费", travelMode: "交通", minutes: "分钟", km: "公里", saveOk: "AI 行程已保存。", saveError: "保存行程失败，请确认登录状态。", generateError: "生成行程失败，请稍后再试。"
    },
    mealOptions: [{ value: "breakfast", label: "早餐" }, { value: "lunch", label: "午餐" }, { value: "tea", label: "下午茶" }, { value: "dinner", label: "晚餐" }, { value: "night", label: "宵夜" }],
    mustHaveOptions: ["Air conditioning", "English menu", "Chinese menu", "Local favorite", "Michelin", "Seafood", "Family friendly"]
  },
  en: {
    presets: [
      { label: "HCMC classics", destination: "Ho Chi Minh City", days: 1, budget: 1200000, style: "local classics", interests: "pho, coffee, banh mi, street food", avoid: "too spicy", transport: "Grab + walk", mealSlots: ["breakfast", "lunch", "tea", "dinner"], mustHaves: ["English menu", "Local favorite"] },
      { label: "Hanoi cafe walk", destination: "Hanoi", days: 1, budget: 1000000, style: "old quarter walk", interests: "egg coffee, old town snacks, Vietnamese food", avoid: "", transport: "walk + Grab", mealSlots: ["breakfast", "tea", "dinner"], mustHaves: ["English menu"] },
      { label: "Da Nang seafood", destination: "Da Nang", days: 1, budget: 2200000, style: "seafood and beach", interests: "seafood, coffee, restaurants near attractions", avoid: "", transport: "Grab", mealSlots: ["lunch", "tea", "dinner"], mustHaves: ["Seafood", "Air conditioning"] }
    ],
    labels: {
      destination: "City", days: "Days", date: "Date", people: "People", budget: "Budget", transport: "Transport", style: "Trip style", currency: "Currency", interests: "Food interests", avoid: "Avoid", meals: "Meal slots", mustHave: "Must-have filters", generate: "Generate AI food trip", generating: "Generating...", result: "AI itinerary generated", optimized: "Route optimized by coordinates", copy: "Copy plan", copied: "Copied", save: "Save trip", openMaps: "Google Maps route", routeMap: "Route map", routeNote: "Route note", budgetNote: "Budget note", restaurantPage: "Restaurant page", directions: "Directions", stops: "stops", dayCount: "Days", estimatedBudget: "Estimated budget", travelMode: "Transport", minutes: "min", km: "km", saveOk: "AI trip saved.", saveError: "Could not save the trip. Please check your login status.", generateError: "Could not generate the trip. Please try again."
    },
    mealOptions: [{ value: "breakfast", label: "Breakfast" }, { value: "lunch", label: "Lunch" }, { value: "tea", label: "Cafe break" }, { value: "dinner", label: "Dinner" }, { value: "night", label: "Late night" }],
    mustHaveOptions: ["Air conditioning", "English menu", "Chinese menu", "Local favorite", "Michelin", "Seafood", "Family friendly"]
  },
  vi: {
    presets: [],
    labels: {
      destination: "Thành phố", days: "Ngày", date: "Ngày đi", people: "Số người", budget: "Ngân sách", transport: "Di chuyển", style: "Phong cách", currency: "Tiền tệ", interests: "Món muốn ăn", avoid: "Tránh", meals: "Bữa ăn", mustHave: "Điều kiện", generate: "Tạo lịch trình AI", generating: "Đang tạo...", result: "Đã tạo lịch trình", optimized: "Tuyến đã tối ưu theo tọa độ", copy: "Sao chép", copied: "Đã sao chép", save: "Lưu", openMaps: "Tuyến Google Maps", routeMap: "Bản đồ tuyến", routeNote: "Ghi chú tuyến", budgetNote: "Ghi chú ngân sách", restaurantPage: "Trang nhà hàng", directions: "Chỉ đường", stops: "điểm", dayCount: "Ngày", estimatedBudget: "Chi phí dự kiến", travelMode: "Di chuyển", minutes: "phút", km: "km", saveOk: "Đã lưu lịch trình.", saveError: "Không thể lưu lịch trình.", generateError: "Không thể tạo lịch trình."
    },
    mealOptions: [{ value: "breakfast", label: "Bữa sáng" }, { value: "lunch", label: "Bữa trưa" }, { value: "tea", label: "Cà phê" }, { value: "dinner", label: "Bữa tối" }, { value: "night", label: "Ăn khuya" }],
    mustHaveOptions: ["Air conditioning", "English menu", "Chinese menu", "Local favorite", "Michelin", "Seafood", "Family friendly"]
  },
  ko: {
    presets: [],
    labels: {
      destination: "도시", days: "일수", date: "날짜", people: "인원", budget: "예산", transport: "교통", style: "여행 스타일", currency: "통화", interests: "먹고 싶은 음식", avoid: "피할 항목", meals: "식사 시간", mustHave: "필수 조건", generate: "AI 미식 일정 생성", generating: "생성 중...", result: "AI 일정 생성 완료", optimized: "좌표 기준으로 경로 최적화", copy: "일정 복사", copied: "복사됨", save: "저장", openMaps: "Google Maps 경로", routeMap: "경로 지도", routeNote: "경로 설명", budgetNote: "예산 설명", restaurantPage: "식당 페이지", directions: "길찾기", stops: "곳", dayCount: "일수", estimatedBudget: "예상 비용", travelMode: "교통", minutes: "분", km: "km", saveOk: "AI 일정이 저장되었습니다.", saveError: "일정을 저장할 수 없습니다.", generateError: "일정을 생성할 수 없습니다."
    },
    mealOptions: [{ value: "breakfast", label: "아침" }, { value: "lunch", label: "점심" }, { value: "tea", label: "카페" }, { value: "dinner", label: "저녁" }, { value: "night", label: "야식" }],
    mustHaveOptions: ["Air conditioning", "English menu", "Chinese menu", "Local favorite", "Michelin", "Seafood", "Family friendly"]
  },
  ja: {
    presets: [],
    labels: {
      destination: "都市", days: "日数", date: "日付", people: "人数", budget: "予算", transport: "交通", style: "旅のスタイル", currency: "通貨", interests: "食べたいもの", avoid: "避けたいもの", meals: "食事時間", mustHave: "必須条件", generate: "AI グルメ旅程を作成", generating: "作成中...", result: "AI 旅程を作成しました", optimized: "座標でルート最適化済み", copy: "コピー", copied: "コピー済み", save: "保存", openMaps: "Google Maps ルート", routeMap: "ルート地図", routeNote: "ルート説明", budgetNote: "予算説明", restaurantPage: "レストランページ", directions: "ナビ", stops: "件", dayCount: "日数", estimatedBudget: "予算目安", travelMode: "交通", minutes: "分", km: "km", saveOk: "AI 旅程を保存しました。", saveError: "旅程を保存できません。", generateError: "旅程を作成できません。"
    },
    mealOptions: [{ value: "breakfast", label: "朝食" }, { value: "lunch", label: "昼食" }, { value: "tea", label: "カフェ" }, { value: "dinner", label: "夕食" }, { value: "night", label: "夜食" }],
    mustHaveOptions: ["Air conditioning", "English menu", "Chinese menu", "Local favorite", "Michelin", "Seafood", "Family friendly"]
  }
};

plannerText["zh-cn"].presets = plannerText["zh-tw"].presets;
plannerText.vi.presets = plannerText.en.presets;
plannerText.ko.presets = plannerText.en.presets;
plannerText.ja.presets = plannerText.en.presets;

function formatMoney(value: number | undefined, currency: string) {
  if (!value) return "-";
  return `${new Intl.NumberFormat("vi-VN").format(value)} ${currency}`;
}

function googleMapsRoute(points: GeneratedPlan["map_points"]) {
  const validPoints = points.filter((point) => point.latitude && point.longitude).slice(0, 10);
  if (!validPoints.length) return "https://www.google.com/maps";
  if (validPoints.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${validPoints[0].latitude},${validPoints[0].longitude}`;
  }
  const [origin, ...rest] = validPoints;
  const destination = rest.at(-1) ?? origin;
  const waypoints = rest.slice(0, -1).map((point) => `${point.latitude},${point.longitude}`).join("|");
  const params = new URLSearchParams({
    api: "1",
    origin: `${origin.latitude},${origin.longitude}`,
    destination: `${destination.latitude},${destination.longitude}`,
    travelmode: "driving"
  });
  if (waypoints) params.set("waypoints", waypoints);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function AITripPlannerForm() {
  const locale = useCurrentLocale();
  const text = plannerText[locale];
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [destination, setDestination] = useState("Ho Chi Minh City");
  const [days, setDays] = useState(1);
  const [travelDate, setTravelDate] = useState(today);
  const [people, setPeople] = useState(2);
  const [budget, setBudget] = useState(1200000);
  const [currency, setCurrency] = useState("VND");
  const [transport, setTransport] = useState("Grab + walk");
  const [style, setStyle] = useState(locale === "en" ? "local classics" : "在地經典");
  const [interests, setInterests] = useState(locale === "en" ? "pho, coffee, banh mi" : "河粉、咖啡、越南小吃");
  const [avoid, setAvoid] = useState("");
  const [mealSlots, setMealSlots] = useState(["breakfast", "lunch", "tea", "dinner"]);
  const [mustHaves, setMustHaves] = useState(["English menu"]);
  const [copied, setCopied] = useState(false);
  const routeUrl = useMemo(() => googleMapsRoute(plan?.map_points ?? []), [plan]);
  const totalStops = plan?.generated_itinerary.days?.reduce((sum, day) => sum + day.items.length, 0) ?? 0;

  useEffect(() => {
    const queryDestination = searchParams.get("destination");
    const focusRestaurant = searchParams.get("focus");
    if (queryDestination) setDestination(queryDestination);
    if (focusRestaurant) setInterests((current) => current.includes(focusRestaurant) ? current : `${focusRestaurant}, ${current}`);
  }, [searchParams]);

  function applyPreset(preset: Preset) {
    setDestination(preset.destination);
    setDays(preset.days);
    setBudget(preset.budget);
    setStyle(preset.style);
    setInterests(preset.interests);
    setAvoid(preset.avoid);
    setTransport(preset.transport);
    setMealSlots(preset.mealSlots);
    setMustHaves(preset.mustHaves);
  }

  function toggleValue(value: string, values: string[], setValues: (next: string[]) => void) {
    setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  function generatePlan() {
    const payload = {
      locale,
      destination,
      days,
      travel_date: travelDate,
      people,
      budget,
      currency,
      transport,
      style,
      interests,
      avoid,
      meal_slots: mealSlots,
      must_haves: mustHaves,
      budget_priority: budget <= 1000000 ? "true" : "false"
    };

    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/ai-trip-plans/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(text.labels.generateError);
        setPlan(await response.json());
      })().catch((error) => window.alert(error.message));
    });
  }

  function savePlan() {
    if (!plan) return;
    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/ai-trip-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(plan)
        });
        if (!response.ok) throw new Error(text.labels.saveError);
        window.alert(text.labels.saveOk);
      })().catch((error) => window.alert(error.message));
    });
  }

  async function copyPlan() {
    if (!plan) return;
    const lines = [
      plan.generated_itinerary.summary,
      ...(plan.generated_itinerary.days ?? []).flatMap((day) => [
        day.title,
        ...day.items.map((item) => `${item.time} ${item.slot}: ${item.title} - ${item.location}`)
      ]),
      `${text.labels.estimatedBudget}: ${formatMoney(plan.estimated_budget, plan.currency)}`
    ].filter(Boolean);
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-5 rounded-lg border bg-card p-5">
        <div className="flex flex-wrap gap-2">
          {text.presets.map((preset) => (
            <Button key={preset.label} type="button" variant="outline" size="sm" onClick={() => applyPreset(preset)}>
              {preset.label}
            </Button>
          ))}
        </div>

        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            generatePlan();
          }}
        >
          <div className="grid gap-3 lg:grid-cols-[1.1fr_110px_150px_110px_170px]">
            <Field label={text.labels.destination}>
              <select className={selectClass} value={destination} onChange={(event) => setDestination(event.target.value)}>
                <option>Ho Chi Minh City</option>
                <option>Hanoi</option>
                <option>Da Nang</option>
                <option>Hoi An</option>
                <option>Nha Trang</option>
                <option>Da Lat</option>
                <option>Phu Quoc</option>
                <option>Hue</option>
                <option>Can Tho</option>
              </select>
            </Field>
            <Field label={text.labels.days}>
              <Input type="number" min={1} max={5} value={days} onChange={(event) => setDays(Number(event.target.value))} />
            </Field>
            <Field label={text.labels.date}>
              <Input type="date" value={travelDate} onChange={(event) => setTravelDate(event.target.value)} />
            </Field>
            <Field label={text.labels.people}>
              <Input type="number" min={1} max={12} value={people} onChange={(event) => setPeople(Number(event.target.value))} />
            </Field>
            <Field label={text.labels.budget}>
              <Input type="number" min={0} step={50000} value={budget} onChange={(event) => setBudget(Number(event.target.value))} />
            </Field>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Field label={text.labels.transport}>
              <select className={selectClass} value={transport} onChange={(event) => setTransport(event.target.value)}>
                <option>Grab + walk</option>
                <option>Grab</option>
                <option>walk + Grab</option>
                <option>taxi</option>
                <option>bus</option>
                <option>motorbike</option>
              </select>
            </Field>
            <Field label={text.labels.style}>
              <Input value={style} onChange={(event) => setStyle(event.target.value)} />
            </Field>
            <Field label={text.labels.currency}>
              <Input value={currency} onChange={(event) => setCurrency(event.target.value)} />
            </Field>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label={text.labels.interests}>
              <Textarea value={interests} onChange={(event) => setInterests(event.target.value)} />
            </Field>
            <Field label={text.labels.avoid}>
              <Textarea value={avoid} onChange={(event) => setAvoid(event.target.value)} />
            </Field>
          </div>

          <ToggleGroup label={text.labels.meals} options={text.mealOptions} values={mealSlots} onToggle={(value) => toggleValue(value, mealSlots, setMealSlots)} />
          <ToggleGroup label={text.labels.mustHave} options={text.mustHaveOptions.map((value) => ({ value, label: value }))} values={mustHaves} onToggle={(value) => toggleValue(value, mustHaves, setMustHaves)} />

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-secondary/60 p-3 text-sm">
            <div className="flex flex-wrap gap-3 text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Users className="h-4 w-4 text-primary" />{people}</span>
              <span className="inline-flex items-center gap-1"><WalletCards className="h-4 w-4 text-primary" />{formatMoney(budget, currency)}</span>
              <span className="inline-flex items-center gap-1"><Utensils className="h-4 w-4 text-primary" />{mealSlots.length}</span>
            </div>
            <Button disabled={isPending || !mealSlots.length}>
              <Bot className="h-4 w-4" />
              {isPending ? text.labels.generating : text.labels.generate}
            </Button>
          </div>
        </form>
      </section>

      {plan ? (
        <section className="grid gap-6 rounded-lg border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                {text.labels.result}
              </div>
              <h2 className="mt-2 text-xl font-semibold">{text.labels.optimized}</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{plan.generated_itinerary.summary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={copyPlan}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? text.labels.copied : text.labels.copy}
              </Button>
              <Button type="button" variant="outline" asChild>
                <a href={routeUrl} target="_blank" rel="noreferrer">
                  <Navigation className="h-4 w-4" />
                  {text.labels.openMaps}
                </a>
              </Button>
              <Button type="button" disabled={isPending} onClick={savePlan}>
                <Save className="h-4 w-4" />
                {text.labels.save}
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <Metric icon={CalendarDays} label={text.labels.dayCount} value={`${plan.generated_itinerary.days?.length ?? days}`} />
            <Metric icon={Utensils} label={text.labels.stops} value={`${totalStops}`} />
            <Metric icon={CircleDollarSign} label={text.labels.estimatedBudget} value={formatMoney(plan.estimated_budget, plan.currency)} />
            <Metric icon={Route} label={text.labels.travelMode} value={transport} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="grid gap-4">
              {plan.generated_itinerary.days?.map((day) => (
                <div key={day.day} className="rounded-lg border bg-background p-4">
                  <div className="flex items-center gap-2 font-semibold">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    {day.title}
                  </div>
                  <div className="mt-4 grid gap-4">
                    {day.items.map((item) => (
                      <div key={`${day.day}-${item.time}-${item.title}`} className="grid gap-3 rounded-lg border bg-card p-3 md:grid-cols-[72px_1fr]">
                        <div className="text-sm font-semibold text-primary">{item.time}</div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge>{item.slot}</Badge>
                            <span className="font-semibold">{item.title}</span>
                          </div>
                          <div className="mt-2 grid gap-1.5 text-sm text-muted-foreground">
                            <span className="flex items-start gap-1"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />{item.location}</span>
                            {item.reason ? <span>{item.reason}</span> : null}
                            {item.note ? <span>{item.note}</span> : null}
                            <span className="flex flex-wrap gap-3">
                              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{item.travel_time_minutes ?? 15} {text.labels.minutes}</span>
                              {typeof item.distance_from_previous_km === "number" ? <span>{item.distance_from_previous_km} {text.labels.km}</span> : null}
                              <span>{item.price_hint ?? formatMoney(item.estimated_price, plan.currency)}</span>
                            </span>
                          </div>
                          {item.recommended_dishes?.length ? (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {item.recommended_dishes.map((dish) => <Badge key={dish}>{dish}</Badge>)}
                            </div>
                          ) : null}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.restaurant_slug ? (
                              <Button asChild variant="outline" size="sm">
                                <Link href={localizeHref(locale, `/restaurants/${item.restaurant_slug}`)}>{text.labels.restaurantPage}</Link>
                              </Button>
                            ) : null}
                            {item.attraction_slug ? (
                              <Button asChild variant="outline" size="sm">
                                <Link href={localizeHref(locale, `/attractions/${item.attraction_slug}`)}>{text.labels.attractionPage ?? "景點頁"}</Link>
                              </Button>
                            ) : null}
                            {item.latitude && item.longitude ? (
                              <Button asChild variant="ghost" size="sm">
                                <a href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`} target="_blank" rel="noreferrer">{text.labels.directions}</a>
                              </Button>
                            ) : null}
                            {item.restaurant_id ? (
                              <AddToTripListButton entityType="restaurant" entityId={item.restaurant_id} title={item.title} latitude={item.latitude} longitude={item.longitude} />
                            ) : null}
                            {item.attraction_id ? (
                              <AddToTripListButton entityType="attraction" entityId={item.attraction_id} title={item.title} latitude={item.latitude} longitude={item.longitude} />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="rounded-lg bg-secondary p-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{text.labels.budgetNote}: </span>
                {plan.generated_itinerary.budget_note}
              </div>
              {plan.suggested_services?.length ? (
                <div className="rounded-lg border bg-background p-4">
                  <h3 className="font-semibold">{text.labels.services ?? "推薦服務"}</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    {plan.suggested_services.map((service) => (
                      <div key={service.id} className="rounded-lg border bg-card p-3 text-sm">
                        <div className="font-semibold">{service.title}</div>
                        <div className="mt-1 text-muted-foreground">{service.description}</div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {service.category ? <Badge>{service.category}</Badge> : null}
                          {service.price_from ? <span className="text-xs text-muted-foreground">from {formatMoney(service.price_from, service.currency ?? plan.currency)}</span> : null}
                        </div>
                        <Button asChild variant="outline" size="sm" className="mt-3">
                          <Link href={localizeHref(locale, `/services?category=${encodeURIComponent(service.category ?? "")}`)}>
                            {service.cta_label || text.labels.servicePage || "查看服務"}
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="grid content-start gap-3 xl:sticky xl:top-20">
              <div className="rounded-lg border bg-background p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Route className="h-4 w-4 text-primary" />
                  {text.labels.routeMap}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.generated_itinerary.route_note}</p>
                <MapView
                  markers={plan.map_points.map((point, index) => ({
                    id: `${index}`,
                    title: point.title,
                    latitude: point.latitude,
                    longitude: point.longitude,
                    href: point.restaurant_slug
                      ? localizeHref(locale, `/restaurants/${point.restaurant_slug}`)
                      : point.attraction_slug
                        ? localizeHref(locale, `/attractions/${point.attraction_slug}`)
                        : undefined,
                    type: point.item_type === "attraction" ? "attraction" : "restaurant"
                  }))}
                  className="mt-3 h-96"
                />
              </div>
            </aside>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

function ToggleGroup({ label, options, values, onToggle }: { label: string; options: Array<{ value: string; label: string }>; values: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="grid gap-2">
      <div className="text-sm font-medium">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onToggle(option.value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${values.includes(option.value) ? "border-primary bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:border-primary"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <div className="mt-2 font-semibold">{value}</div>
    </div>
  );
}
