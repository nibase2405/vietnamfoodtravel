import { FoodMapExplorer } from "@/components/map/FoodMapExplorer";
import { localizeHref } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublicRestaurantsData } from "@/lib/data/queries";

export const revalidate = 300;

export async function generateMetadata() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return pageMetadata({
    title: dict.foodMap.title,
    description: dict.foodMap.description,
    path: "/food-map"
  });
}

export default async function FoodMapPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const locale = await getCurrentLocale();
  const params = await searchParams;
  const restaurants = await getPublicRestaurantsData(params);
  const markers = restaurants
    .filter((item) => item.latitude && item.longitude)
    .map((item) => ({
      id: item.id,
      title: item.name,
      subtitle: `${item.destinations?.city ?? "Vietnam"} · ${item.average_spend ?? ""}`,
      latitude: item.latitude!,
      longitude: item.longitude!,
      href: localizeHref(locale, `/restaurants/${item.slug}`),
      type: "restaurant" as const
    }));

  return <FoodMapExplorer locale={locale} restaurants={restaurants} markers={markers} />;
}
