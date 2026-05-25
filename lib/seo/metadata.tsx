import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const defaultOg = "/og-vietfood-map.jpg";

export function pageMetadata({
  title,
  description,
  path = "/",
  image = defaultOg
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
}): Metadata {
  const canonical = new URL(path, siteUrl).toString();
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "zh-TW": new URL(`/zh-tw${path === "/" ? "" : path}`, siteUrl).toString(),
        "zh-CN": new URL(`/zh-cn${path === "/" ? "" : path}`, siteUrl).toString(),
        en: new URL(`/en${path === "/" ? "" : path}`, siteUrl).toString(),
        vi: new URL(`/vi${path === "/" ? "" : path}`, siteUrl).toString()
      }
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [image],
      locale: "zh_TW",
      type: "website"
    }
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
