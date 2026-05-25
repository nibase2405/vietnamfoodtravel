import { z } from "zod";

const phone = z.string().min(6, "請輸入有效電話").max(30, "電話長度過長");
const requiredText = z.string().min(1, "此欄位必填");

export const destinationSchema = z.object({
  city: requiredText,
  slug: requiredText,
  country: z.string().default("Vietnam"),
  region: z.enum(["north", "central", "south"]),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  cover_image_url: z.string().url().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  sort_order: z.coerce.number().int().default(0)
});

export const loginSchema = z.object({
  email: z.string().email("Email 格式不正確"),
  password: z.string().min(8, "密碼至少需要 8 個字元")
});

export const registerSchema = loginSchema.extend({
  full_name: requiredText
});

export const bookingSchema = z.object({
  travel_date: z.string().min(1, "請選擇日期"),
  people_count: z.coerce.number().int().positive("人數必須大於 0"),
  contact_name: requiredText,
  contact_phone: phone,
  contact_email: z.string().email("Email 格式不正確"),
  notes: z.string().optional()
});

export const customTripRequestSchema = z.object({
  name: requiredText,
  email: z.string().email("Email 格式不正確"),
  phone,
  travel_start_date: z.string().min(1, "請選擇開始日期"),
  travel_end_date: z.string().min(1, "請選擇結束日期"),
  people_count: z.coerce.number().int().positive(),
  budget_min: z.coerce.number().nonnegative(),
  budget_max: z.coerce.number().positive(),
  currency: z.string().default("USD"),
  preferred_cities: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  need_guide: z.boolean().default(false),
  need_car: z.boolean().default(false),
  need_hotel: z.boolean().default(false),
  language_preference: z.array(z.string()).default([]),
  admin_notes: z.string().optional()
});

export const tourSchema = z.object({
  title: requiredText,
  slug: requiredText,
  destination_id: z.string().uuid().optional(),
  tour_type: z.enum(["private", "semi_self_guided", "group", "day_trip", "custom"]),
  duration_days: z.coerce.number().int().positive(),
  duration_nights: z.coerce.number().int().nonnegative(),
  min_people: z.coerce.number().int().positive(),
  max_people: z.coerce.number().int().positive(),
  base_price: z.coerce.number().nonnegative(),
  currency: z.string().default("USD"),
  status: z.enum(["draft", "published"]).default("draft"),
  cover_image_url: z.string().url().optional()
});

export const restaurantSchema = z.object({
  name: requiredText,
  slug: requiredText,
  address: requiredText,
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  phone: z.string().optional(),
  website_url: z.string().url().optional(),
  google_maps_url: z.string().url().optional(),
  price_range: z.enum(["low", "medium", "high", "luxury"]),
  status: z.enum(["draft", "published", "claimed", "closed"]).default("draft"),
  cover_image_url: z.string().url().optional()
});

export const attractionSchema = z.object({
  name: requiredText,
  slug: requiredText,
  address: requiredText,
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  price_info: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  cover_image_url: z.string().url().optional()
});

export const guideApplySchema = z.object({
  display_name: requiredText,
  email: z.string().email(),
  phone,
  service_cities: z.array(z.string()).min(1),
  languages: z.array(z.string()).min(1),
  specialties: z.array(z.string()).default([]),
  bio: requiredText,
  hourly_rate: z.coerce.number().nonnegative(),
  daily_rate: z.coerce.number().nonnegative(),
  avatar_url: z.string().url().optional()
});

export const guideServiceSchema = z.object({
  title: requiredText,
  description: z.string().optional(),
  service_type: z.enum(["hourly", "half_day", "full_day", "airport_pickup", "custom"]),
  price: z.coerce.number().nonnegative(),
  duration_hours: z.coerce.number().positive()
});

export const blogPostSchema = z.object({
  title: requiredText,
  slug: requiredText,
  category: requiredText,
  excerpt: z.string().optional(),
  content: z.unknown(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  cover_image_url: z.string().url().optional()
});

export const adCampaignSchema = z.object({
  title: requiredText,
  placement: z.enum(["homepage_banner", "map_featured", "restaurant_featured", "blog_banner", "destination_page"]),
  target_city: requiredText,
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  budget: z.coerce.number().positive(),
  link_url: z.string().url().optional(),
  image_url: z.string().url().optional()
});

export const seoPageSchema = z.object({
  path: requiredText,
  language_code: requiredText,
  title: requiredText,
  description: requiredText,
  og_image_url: z.string().url().optional(),
  schema_json: z.unknown().optional(),
  hreflang: z.unknown().optional()
});
