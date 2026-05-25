import type { MetadataRoute } from "next";
import { getPublicAttractionsData, getPublicBlogPostsData, getPublicDestinationsData, getPublicKOLsData, getPublicRestaurantsData, getPublicToursData } from "@/lib/data/queries";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [destinations, tours, restaurants, attractions, kols, posts] = await Promise.all([
    getPublicDestinationsData(),
    getPublicToursData(),
    getPublicRestaurantsData(),
    getPublicAttractionsData(),
    getPublicKOLsData(),
    getPublicBlogPostsData()
  ]);
  const staticPaths = ["/", "/tours", "/guides", "/services", "/medical-clinics", "/food-map", "/attractions", "/kol-recommendations", "/ai-trip-planner", "/custom-trip", "/blog", "/about", "/contact", "/merchant", "/guide-apply"];
  return [
    ...staticPaths.map((path) => ({ url: `${siteUrl}${path}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.7 })),
    ...destinations.map((item) => ({ url: `${siteUrl}/destinations/${item.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...tours.map((item) => ({ url: `${siteUrl}/tours/${item.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...restaurants.map((item) => ({ url: `${siteUrl}/restaurants/${item.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...attractions.map((item) => ({ url: `${siteUrl}/attractions/${item.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...kols.map((item) => ({ url: `${siteUrl}/kol-recommendations/${item.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 })),
    ...posts.map((item) => ({ url: `${siteUrl}/blog/${item.slug}`, lastModified: item.published_at ? new Date(item.published_at) : new Date(), changeFrequency: "monthly" as const, priority: 0.6 }))
  ];
}
