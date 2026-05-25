import { NextResponse } from "next/server";
import { getPublicAttractionsData, getPublicBlogPostsData, getPublicGuidesData, getPublicRestaurantsData, getPublicToursData } from "@/lib/data/queries";

function includes(value: unknown, q: string) {
  return String(value ?? "").toLowerCase().includes(q.toLowerCase());
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? url.searchParams.get("destination") ?? "";
  if (!q.trim()) return NextResponse.json({ tours: [], restaurants: [], attractions: [], guides: [], posts: [] });
  const [tours, restaurants, attractions, guides, posts] = await Promise.all([
    getPublicToursData(),
    getPublicRestaurantsData(),
    getPublicAttractionsData(),
    getPublicGuidesData(),
    getPublicBlogPostsData()
  ]);
  return NextResponse.json({
    tours: tours.filter((item) => includes(item.title, q) || includes(item.destinations?.city, q)).slice(0, 8),
    restaurants: restaurants.filter((item) => includes(item.name, q) || includes(item.address, q) || item.cuisine_type?.some((tag) => includes(tag, q))).slice(0, 8),
    attractions: attractions.filter((item) => includes(item.name, q) || includes(item.address, q) || item.category?.some((tag) => includes(tag, q))).slice(0, 8),
    guides: guides.filter((item) => includes(item.display_name, q) || item.service_cities?.some((city) => includes(city, q))).slice(0, 8),
    posts: posts.filter((item) => includes(item.title, q) || includes(item.excerpt, q) || includes(item.category, q)).slice(0, 8)
  });
}
