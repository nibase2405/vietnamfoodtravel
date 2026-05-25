import type { MedicalClinic } from "@/types";

export const MEDICAL_CLINIC_STORAGE_KEY = "vietfood:medical-clinics:v1";

export const medicalClinicCategories = ["綜合門診", "旅遊醫學", "牙科", "皮膚科", "兒科", "婦產科", "物理治療", "急診協助"];
export const medicalClinicCities = ["Ho Chi Minh City", "Hanoi", "Da Nang", "Hoi An"];
export const medicalClinicLanguages = ["繁中", "简中", "English", "Tiếng Việt", "한국어", "日本語"];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asNumber(value: unknown, fallback: number | null = null) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function asBoolean(value: unknown) {
  return value === true || value === "true" || value === "on" || value === "1";
}

function asStringArray(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function slugifyMedicalClinicName(name: string) {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return slug || `medical-clinic-${Date.now()}`;
}

export function normalizeMedicalClinic(value: unknown): MedicalClinic {
  const row = asRecord(value);
  const name = String(row.name ?? row.title ?? "未命名診所").trim();
  const slug = String(row.slug ?? "").trim() || slugifyMedicalClinicName(name);

  return {
    id: String(row.id ?? slug),
    name,
    slug,
    category: String(row.category ?? "綜合門診").trim(),
    description: String(row.description ?? "").trim() || null,
    city: String(row.city ?? "").trim() || null,
    district: String(row.district ?? "").trim() || null,
    address: String(row.address ?? "").trim() || null,
    latitude: asNumber(row.latitude),
    longitude: asNumber(row.longitude),
    phone: String(row.phone ?? "").trim() || null,
    website: String(row.website ?? row.website_url ?? "").trim() || null,
    opening_hours: String(row.opening_hours ?? row.openingHours ?? "").trim() || null,
    languages: asStringArray(row.languages),
    services: asStringArray(row.services),
    insurance: String(row.insurance ?? "").trim() || null,
    price_note: String(row.price_note ?? row.priceNote ?? "").trim() || null,
    cover_image_url: String(row.cover_image_url ?? row.coverImageUrl ?? "").trim() || null,
    status: String(row.status ?? "published").trim(),
    is_featured: asBoolean(row.is_featured ?? row.isFeatured),
    is_emergency: asBoolean(row.is_emergency ?? row.isEmergency),
    sort_order: asNumber(row.sort_order ?? row.sortOrder, 0) ?? 0,
    created_at: String(row.created_at ?? "").trim() || null,
    updated_at: String(row.updated_at ?? "").trim() || null
  };
}

export function normalizeMedicalClinics(value: unknown): MedicalClinic[] {
  return Array.isArray(value) ? value.map(normalizeMedicalClinic) : [];
}

export function mergeMedicalClinics(initialClinics: MedicalClinic[], localClinics: MedicalClinic[]) {
  const bySlug = new Map<string, MedicalClinic>();
  [...initialClinics, ...localClinics].forEach((clinic) => bySlug.set(clinic.slug, clinic));
  return [...bySlug.values()]
    .filter((clinic) => clinic.status !== "archived")
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order || a.name.localeCompare(b.name));
}
