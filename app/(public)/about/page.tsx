import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({ title: "關於我們", description: "Vietnam Travel Platform 品牌與服務介紹。", path: "/about" });

export default function AboutPage() {
  return <main className="mx-auto max-w-4xl px-4 py-12"><h1 className="text-3xl font-semibold">關於我們</h1><p className="mt-4 text-muted-foreground">我們結合半自助旅行、中文導遊、餐廳地圖、景點地圖與客製規劃，讓越南自由行更有彈性與品質。</p></main>;
}
