import { ImageResponse } from "next/og";
import { getPublicCityGuidesData } from "@/lib/data/queries";
import { getCurrentLocale } from "@/lib/i18n/server";

export const runtime = "edge";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, locale] = await Promise.all([params, getCurrentLocale()]);
  const guide = (await getPublicCityGuidesData(locale)).find((item) => item.slug === slug);
  const title = guide?.seoTitle || guide?.title || guide?.city || "Vietnam Food Map";
  const summary = guide?.seoDescription || guide?.summary || "City food guide with restaurants, attractions, services, rankings, and AI itinerary planning.";
  const themes = guide?.foodThemes.slice(0, 4) ?? ["Food map", "AI itinerary", "Rankings"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          color: "#f8fafc",
          background: "linear-gradient(135deg, #0f3f3a 0%, #176b5d 48%, #d97706 100%)",
          fontFamily: "Arial, sans-serif"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28, fontWeight: 700 }}>
          <span>VietFood Map</span>
          <span style={{ border: "2px solid rgba(255,255,255,.65)", borderRadius: 999, padding: "10px 18px" }}>{guide?.region ?? "Vietnam"}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ fontSize: 76, lineHeight: 1.05, fontWeight: 800, letterSpacing: 0, maxWidth: 940 }}>{title}</div>
          <div style={{ fontSize: 30, lineHeight: 1.45, maxWidth: 960, color: "rgba(248,250,252,.88)" }}>{summary}</div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {themes.map((theme) => (
              <span key={theme} style={{ borderRadius: 999, background: "rgba(255,255,255,.18)", padding: "12px 20px", fontSize: 25, fontWeight: 700 }}>
                {theme}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 24, color: "rgba(248,250,252,.86)" }}>
          <span>{guide?.restaurants.length ?? 0} restaurants</span>
          <span>{guide?.attractions.length ?? 0} attractions</span>
          <span>{guide?.services.length ?? 0} services</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
