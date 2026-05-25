import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";
import { getPublicServicesData } from "@/lib/data/queries";
import { normalizeService } from "@/lib/services";

export async function GET() {
  return NextResponse.json(await getPublicServicesData());
}

export async function POST(request: Request) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  if (!supabase) return NextResponse.json({ error: "Missing Supabase client" }, { status: 503 });

  const service = normalizeService(await jsonBody(request));
  const payload = {
    title: service.title,
    slug: service.slug,
    category: service.category,
    city: service.city,
    description: service.description,
    price_from: service.price_from,
    currency: service.currency,
    duration: service.duration,
    cover_image_url: service.cover_image_url,
    status: service.status,
    is_featured: service.is_featured,
    sort_order: service.sort_order,
    cta_label: service.cta_label,
    cta_href: service.cta_href,
    tags: service.tags,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from("services").insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(normalizeService(data), { status: 201 });
}
