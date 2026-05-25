import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";
import { getPublicMedicalClinicsData } from "@/lib/data/queries";
import { normalizeMedicalClinic } from "@/lib/medical-clinics";

export async function GET() {
  return NextResponse.json(await getPublicMedicalClinicsData());
}

export async function POST(request: Request) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  if (!supabase) return NextResponse.json({ error: "Missing Supabase client" }, { status: 503 });

  const clinic = normalizeMedicalClinic(await jsonBody(request));
  const payload = {
    name: clinic.name,
    slug: clinic.slug,
    category: clinic.category,
    description: clinic.description,
    city: clinic.city,
    district: clinic.district,
    address: clinic.address,
    latitude: clinic.latitude,
    longitude: clinic.longitude,
    phone: clinic.phone,
    website: clinic.website,
    opening_hours: clinic.opening_hours,
    languages: clinic.languages,
    services: clinic.services,
    insurance: clinic.insurance,
    price_note: clinic.price_note,
    cover_image_url: clinic.cover_image_url,
    status: clinic.status,
    is_featured: clinic.is_featured,
    is_emergency: clinic.is_emergency,
    sort_order: clinic.sort_order,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from("medical_clinics").insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(normalizeMedicalClinic(data), { status: 201 });
}
