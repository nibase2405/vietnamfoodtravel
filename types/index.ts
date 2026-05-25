export type UserRole = "user" | "guide" | "merchant" | "admin" | "super_admin";
export type PublishStatus = "draft" | "published" | "archived";

export type Destination = {
  id: string;
  city: string;
  slug: string;
  region: "north" | "central" | "south";
  latitude: number | null;
  longitude: number | null;
  cover_image_url: string | null;
  status: string;
};

export type Tour = {
  id: string;
  destination_id: string | null;
  title: string;
  slug: string;
  tour_type: "private" | "semi_self_guided" | "group" | "day_trip" | "custom";
  theme: string[] | null;
  duration_days: number | null;
  duration_nights: number | null;
  min_people: number | null;
  max_people: number | null;
  base_price: number | null;
  currency: string;
  cover_image_url: string | null;
  gallery_urls: string[] | null;
  status: string;
  is_featured: boolean;
  destinations?: Destination | null;
};

export type Restaurant = {
  id: string;
  destination_id: string | null;
  name: string;
  slug: string;
  multilingual_names?: Partial<Record<"zh-TW" | "zh-CN" | "vi" | "en" | "ko" | "ja", string>>;
  description?: string;
  cuisine_type: string[] | null;
  price_range: "low" | "medium" | "high" | "luxury" | null;
  price_min?: number | null;
  price_max?: number | null;
  average_spend?: string | null;
  address: string | null;
  district?: string | null;
  phone?: string | null;
  opening_hours?: string | null;
  is_open?: boolean;
  languages?: string[];
  features?: string[];
  recommended_dishes?: string[];
  distance_km?: number | null;
  sponsored?: boolean;
  latitude: number | null;
  longitude: number | null;
  rating_avg: number | null;
  review_count: number | null;
  booking_count?: number | null;
  local_booking_count?: number | null;
  view_count?: number | null;
  cover_image_url: string | null;
  gallery_urls?: string[];
  menu_images?: string[];
  menu_items?: FoodMenuItem[];
  restaurant_menu_items?: FoodMenuItem[];
  ai_review_summary?: AiReviewSummary;
  status: string;
  is_featured: boolean;
  destinations?: Destination | null;
};

export type FoodMenuItem = {
  id: string;
  name: string;
  translations: Partial<Record<"zh-TW" | "zh-CN" | "vi" | "en" | "ko" | "ja", string>>;
  price: number;
  currency: "VND" | "USD";
  description: string;
  photo_url?: string;
  spicy_level: 0 | 1 | 2 | 3;
  is_vegetarian: boolean;
  allergens: string[];
  tags: string[];
};

export type AiReviewSummary = {
  pros: string[];
  cons: string[];
  recommended_dishes: string[];
  best_for: string[];
  average_spend: string;
  notes: string[];
};

export type Attraction = {
  id: string;
  destination_id: string | null;
  name: string;
  slug: string;
  category: string[] | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  cover_image_url: string | null;
  rating_avg: number | null;
  status: string;
  destinations?: Destination | null;
};

export type Guide = {
  id: string;
  user_id: string | null;
  display_name: string | null;
  bio: string | null;
  languages: string[] | null;
  service_cities: string[] | null;
  specialties: string[] | null;
  hourly_rate: number | null;
  daily_rate: number | null;
  currency: string;
  rating_avg: number | null;
  review_count: number | null;
  status: string;
};

export type Service = {
  id: string;
  title: string;
  slug: string;
  category: string;
  city: string | null;
  description: string;
  price_from: number | null;
  currency: string;
  duration: string | null;
  cover_image_url: string | null;
  status: string;
  is_featured: boolean;
  sort_order: number;
  cta_label: string | null;
  cta_href: string | null;
  tags: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type MedicalClinic = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  opening_hours: string | null;
  languages: string[] | null;
  services: string[] | null;
  insurance: string | null;
  price_note: string | null;
  cover_image_url: string | null;
  status: string;
  is_featured: boolean;
  is_emergency: boolean;
  sort_order: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export type KOLVisit = {
  id: string;
  kol_id?: string | null;
  entity_type: "restaurant" | "attraction" | "custom";
  visit_type: "food" | "attraction";
  restaurant_slug?: string | null;
  attraction_slug?: string | null;
  title: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  cover_image_url?: string | null;
  rating?: number | null;
  content_url?: string | null;
  visited_at?: string | null;
  status: string;
  sort_order: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export type KOL = {
  id: string;
  name: string;
  slug: string;
  handle?: string | null;
  avatar_url?: string | null;
  cover_image_url?: string | null;
  bio?: string | null;
  city?: string | null;
  languages: string[] | null;
  specialty_tags: string[] | null;
  social_links?: Record<string, string> | null;
  follower_count?: number | null;
  status: string;
  is_featured: boolean;
  sort_order: number;
  visits?: KOLVisit[];
  created_at?: string | null;
  updated_at?: string | null;
};

export type HomeQuickCategory = {
  id: string;
  title: string;
  slug: string;
  description: string;
  href: string;
  status: string;
  is_featured: boolean;
  sort_order: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  tags: string[] | null;
  cover_image_url: string | null;
  excerpt: string | null;
  content: unknown;
  status: string;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

export type MapMarker = {
  id: string;
  title: string;
  subtitle?: string;
  latitude: number;
  longitude: number;
  href?: string;
  type?: "restaurant" | "attraction" | "tour" | "guide" | "medical";
};
