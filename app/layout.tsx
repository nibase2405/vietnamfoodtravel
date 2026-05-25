import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { htmlLangByLocale, normalizeLocale } from "@/lib/i18n/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "VietFood Map | 越南美食地圖",
    template: "%s | VietFood Map"
  },
  description: "用地圖探索越南餐廳、小吃、價格、評論與 AI 美食行程規劃。"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);
  const locale = normalizeLocale(headerStore.get("x-vietfood-locale") ?? cookieStore.get("vietfood_locale")?.value);

  return (
    <html lang={htmlLangByLocale[locale]} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
