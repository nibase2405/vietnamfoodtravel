import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";

type ImportedGoogleBusiness = {
  name?: string;
  slug?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  google_maps_url: string;
  warnings: string[];
};

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

async function requireAdminWhenConfigured() {
  if (!hasSupabaseEnv()) return null;
  const { response } = await requireApiAdmin();
  return response;
}

function firstUrl(value: string) {
  return value.match(/https?:\/\/\S+/)?.[0]?.replace(/[),，。]+$/, "") ?? value.trim();
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function isGoogleMapsUrl(url: URL) {
  const host = url.hostname.toLowerCase();
  return (
    host === "maps.app.goo.gl" ||
    host === "goo.gl" ||
    host.endsWith(".google.com") ||
    host === "google.com" ||
    host === "maps.google.com"
  );
}

function cleanGoogleTitle(value: string) {
  return value
    .replace(/\s*-\s*Google Maps\s*$/i, "")
    .replace(/\s*·\s*Google Maps\s*$/i, "")
    .replace(/\s*\|\s*Google Maps\s*$/i, "")
    .trim();
}

function htmlDecode(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function extractTitle(html: string) {
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1];
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
  return cleanGoogleTitle(htmlDecode(ogTitle ?? title ?? ""));
}

function extractFromUrl(url: string): Partial<ImportedGoogleBusiness> {
  const parsed = new URL(url);
  const decoded = decodeURIComponent(url.replace(/\+/g, " "));
  const byPlacePath = decoded.match(/\/place\/([^/@?]+)/i)?.[1];
  const byQuery = parsed.searchParams.get("q") ?? parsed.searchParams.get("query") ?? "";
  const name = cleanGoogleTitle((byPlacePath || byQuery).replace(/\s+/g, " ").trim());
  const atCoordinates = decoded.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  const bangCoordinates = decoded.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  const queryCoordinates = byQuery.match(/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  const coordinates = atCoordinates ?? bangCoordinates ?? queryCoordinates;

  return {
    name: name || undefined,
    slug: name ? slugify(name) : undefined,
    latitude: coordinates ? Number(coordinates[1]) : undefined,
    longitude: coordinates ? Number(coordinates[2]) : undefined
  };
}

async function resolveGoogleUrl(input: string) {
  const initial = new URL(input);
  let resolved = initial.toString();
  let html = "";

  try {
    const response = await fetch(initial, {
      redirect: "follow",
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; VietFoodMapAdminImporter/1.0)"
      }
    });
    resolved = response.url || resolved;
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("text/html")) {
      html = await response.text();
    }
  } catch {
    // Keep the original URL. Some short links cannot be expanded from server environments.
  }

  return { resolved, html };
}

export async function POST(request: Request) {
  const adminResponse = await requireAdminWhenConfigured();
  if (adminResponse) return adminResponse;

  const payload = await jsonBody(request);
  const shareUrl = firstUrl(String(payload.shareUrl ?? ""));
  if (!shareUrl) return NextResponse.json({ error: "請貼上 Google Maps 或 Google 我的商家分享連結" }, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(shareUrl);
  } catch {
    return NextResponse.json({ error: "連結格式不正確，請貼上完整 https:// 開頭的 Google 分享連結" }, { status: 400 });
  }

  if (!isGoogleMapsUrl(parsed)) {
    return NextResponse.json({ error: "目前只支援 Google Maps / Google 我的商家分享連結" }, { status: 400 });
  }

  const { resolved, html } = await resolveGoogleUrl(shareUrl);
  const extracted = extractFromUrl(resolved);
  const title = html ? extractTitle(html) : "";
  const name = extracted.name || title || undefined;
  const warnings: string[] = [];
  if (!hasSupabaseEnv()) warnings.push("目前是未連接 Supabase 的 demo 模式，匯入可預覽，但儲存餐廳需要設定 Supabase。");
  if (!name) warnings.push("無法從分享連結辨識店名，請手動填寫餐廳名稱。");
  if (extracted.latitude === undefined || extracted.longitude === undefined) warnings.push("無法從分享連結辨識座標，請用地圖座標選取器補上。");

  return NextResponse.json({
    ...extracted,
    name,
    slug: name ? slugify(name) : extracted.slug,
    google_maps_url: resolved,
    warnings
  } satisfies ImportedGoogleBusiness);
}
