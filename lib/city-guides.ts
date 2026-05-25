import { attractions, destinations, medicalClinics, restaurants, services } from "@/lib/data/mock";
import type { Attraction, Destination, MedicalClinic, Restaurant, Service } from "@/types";

export type CityGuide = {
  id: string;
  city: string;
  title?: string;
  slug: string;
  region: "north" | "central" | "south";
  latitude: number;
  longitude: number;
  cover_image_url: string;
  summary: string;
  seoTitle?: string;
  seoDescription?: string;
  foodThemes: string[];
  districts: string[];
  suggestedPlan: string[];
  seoKeywords: string[];
  languageCode?: string;
  status?: "published" | "draft" | "archived";
  is_featured?: boolean;
  sort_order?: number;
  destination?: Destination;
  restaurants: Restaurant[];
  attractions: Attraction[];
  services: Service[];
  clinics: MedicalClinic[];
};

const cityProfiles: Array<Omit<CityGuide, "destination" | "restaurants" | "attractions" | "services" | "clinics">> = [
  {
    id: "hcm",
    city: "Ho Chi Minh City",
    slug: "ho-chi-minh",
    region: "south",
    latitude: 10.7769,
    longitude: 106.7009,
    cover_image_url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482",
    summary: "Vietnam's busiest food city for pho, banh mi, coffee, hot pot, modern cafes, and late-night eating.",
    foodThemes: ["Pho", "Banh mi", "Coffee", "Hot pot", "Late-night food"],
    districts: ["District 1", "District 3", "District 7", "Thao Dien", "Ben Thanh"],
    suggestedPlan: ["Breakfast pho in District 1", "Coffee near Ben Thanh", "Vietnamese lunch", "Evening hot pot or seafood"],
    seoKeywords: ["Ho Chi Minh food map", "District 1 restaurants", "Saigon pho", "Ho Chi Minh cafes"]
  },
  {
    id: "hanoi",
    city: "Hanoi",
    slug: "hanoi",
    region: "north",
    latitude: 21.0278,
    longitude: 105.8342,
    cover_image_url: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a",
    summary: "Northern Vietnam's classic food capital with egg coffee, old quarter snacks, bun cha, pho, and slow cafe routes.",
    foodThemes: ["Egg coffee", "Bun cha", "Pho", "Old Quarter snacks", "Cafe"],
    districts: ["Old Quarter", "Hoan Kiem", "Tay Ho", "Ba Dinh"],
    suggestedPlan: ["Old Quarter breakfast", "Egg coffee stop", "Bun cha lunch", "Lake-side dinner"],
    seoKeywords: ["Hanoi food guide", "Hanoi egg coffee", "Old Quarter restaurants", "Hanoi pho"]
  },
  {
    id: "danang",
    city: "Da Nang",
    slug: "da-nang",
    region: "central",
    latitude: 16.0544,
    longitude: 108.2022,
    cover_image_url: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b",
    summary: "A coastal food base for seafood, beach cafes, central Vietnam noodles, and easy day trips.",
    foodThemes: ["Seafood", "Mi Quang", "Beach cafes", "Central noodles"],
    districts: ["My Khe", "Han River", "Son Tra", "An Thuong"],
    suggestedPlan: ["Beach coffee", "Mi Quang lunch", "Seafood dinner", "Night market snacks"],
    seoKeywords: ["Da Nang seafood", "Da Nang food guide", "My Khe restaurants", "Da Nang cafes"]
  },
  {
    id: "hoian",
    city: "Hoi An",
    slug: "hoi-an",
    region: "central",
    latitude: 15.8801,
    longitude: 108.338,
    cover_image_url: "https://images.unsplash.com/photo-1528127269322-539801943592",
    summary: "A walkable heritage city for cao lau, banh mi, riverside cafes, markets, and evening snacks.",
    foodThemes: ["Cao lau", "Banh mi", "Riverside cafes", "Market snacks"],
    districts: ["Ancient Town", "An Bang", "Cam Chau", "Riverside"],
    suggestedPlan: ["Market breakfast", "Ancient town cafe", "Cao lau lunch", "Riverside dinner"],
    seoKeywords: ["Hoi An food guide", "Hoi An banh mi", "Cao lau", "Hoi An restaurants"]
  },
  {
    id: "nhatrang",
    city: "Nha Trang",
    slug: "nha-trang",
    region: "central",
    latitude: 12.2388,
    longitude: 109.1967,
    cover_image_url: "https://images.unsplash.com/photo-1597466599360-3b9775841aec",
    summary: "A beach city for seafood, grilled dishes, cafes, and relaxed island-trip meals.",
    foodThemes: ["Seafood", "Grill", "Beach cafes", "Noodles"],
    districts: ["Tran Phu", "Vinh Nguyen", "Hon Chong"],
    suggestedPlan: ["Beach breakfast", "Seafood lunch", "Cafe break", "Grilled seafood dinner"],
    seoKeywords: ["Nha Trang seafood", "Nha Trang food guide", "Nha Trang restaurants"]
  },
  {
    id: "dalat",
    city: "Da Lat",
    slug: "da-lat",
    region: "central",
    latitude: 11.9404,
    longitude: 108.4583,
    cover_image_url: "https://images.unsplash.com/photo-1584533813444-99416b4c7ac1",
    summary: "A cool highland city known for cafes, strawberries, hot soy milk, bakeries, and night market snacks.",
    foodThemes: ["Cafe", "Bakery", "Night market", "Hot pot"],
    districts: ["Da Lat Market", "Xuan Huong Lake", "Ward 3"],
    suggestedPlan: ["Lake cafe", "Market lunch", "Bakery stop", "Hot pot dinner"],
    seoKeywords: ["Da Lat cafes", "Da Lat food guide", "Da Lat night market"]
  },
  {
    id: "phuquoc",
    city: "Phu Quoc",
    slug: "phu-quoc",
    region: "south",
    latitude: 10.2899,
    longitude: 103.984,
    cover_image_url: "https://images.unsplash.com/photo-1573790387438-4da905039392",
    summary: "An island destination for seafood, beach bars, night markets, and resort-friendly dining.",
    foodThemes: ["Seafood", "Night market", "Beach bar", "Resort dining"],
    districts: ["Duong Dong", "An Thoi", "Long Beach"],
    suggestedPlan: ["Beach brunch", "Island cafe", "Seafood dinner", "Night market snacks"],
    seoKeywords: ["Phu Quoc food", "Phu Quoc seafood", "Phu Quoc night market"]
  },
  {
    id: "hue",
    city: "Hue",
    slug: "hue",
    region: "central",
    latitude: 16.4637,
    longitude: 107.5909,
    cover_image_url: "https://images.unsplash.com/photo-1528127269322-539801943592",
    summary: "A central heritage city famous for bun bo Hue, royal snacks, rice cakes, and riverside meals.",
    foodThemes: ["Bun bo Hue", "Royal cuisine", "Rice cakes", "Riverside meals"],
    districts: ["Citadel", "Perfume River", "An Cuu"],
    suggestedPlan: ["Bun bo Hue breakfast", "Citadel snack route", "Cafe break", "Royal-style dinner"],
    seoKeywords: ["Hue food guide", "Bun bo Hue", "Hue restaurants"]
  },
  {
    id: "cantho",
    city: "Can Tho",
    slug: "can-tho",
    region: "south",
    latitude: 10.0452,
    longitude: 105.7469,
    cover_image_url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482",
    summary: "The Mekong Delta food base for floating market breakfasts, noodle soups, tropical fruit, and river meals.",
    foodThemes: ["Floating market", "Noodle soup", "Tropical fruit", "River meals"],
    districts: ["Ninh Kieu", "Cai Rang", "Binh Thuy"],
    suggestedPlan: ["Floating market breakfast", "Fruit stop", "Noodle lunch", "River dinner"],
    seoKeywords: ["Can Tho food guide", "Cai Rang floating market", "Mekong Delta food"]
  }
];

let cachedCityGuides: CityGuide[] | null = null;

function matchesCity(value: string | null | undefined, city: string, id: string) {
  const text = String(value ?? "").toLowerCase();
  return text.includes(city.toLowerCase()) || text.includes(id.toLowerCase());
}

export function getCityGuides(): CityGuide[] {
  if (cachedCityGuides) return cachedCityGuides;

  cachedCityGuides = cityProfiles.map((profile) => {
    const destination = destinations.find((item) => item.id === profile.id || item.slug === profile.slug);
    return {
      ...profile,
      destination,
      restaurants: restaurants.filter((item) => item.destination_id === profile.id || matchesCity(item.destinations?.city, profile.city, profile.id)),
      attractions: attractions.filter((item) => item.destination_id === profile.id || matchesCity(item.destinations?.city, profile.city, profile.id)),
      services: services.filter((item) => matchesCity(item.city, profile.city, profile.id)),
      clinics: medicalClinics.filter((item) => matchesCity(item.city, profile.city, profile.id))
    };
  });
  return cachedCityGuides;
}

export function getCityGuideBySlug(slug: string) {
  return getCityGuides().find((guide) => guide.slug === slug) ?? null;
}
