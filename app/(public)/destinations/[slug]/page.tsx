import { notFound } from "next/navigation";
import { AttractionCard } from "@/components/cards/AttractionCard";
import { RestaurantCard } from "@/components/cards/RestaurantCard";
import { TourCard } from "@/components/cards/TourCard";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublicAttractionsData, getPublicDestinationBySlugData, getPublicRestaurantsData, getPublicToursData } from "@/lib/data/queries";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destination = await getPublicDestinationBySlugData(slug);
  return pageMetadata({
    title: `${destination?.city ?? "越南"}美食地圖`,
    description: "城市美食地圖、餐廳推薦、價格資訊、AI 美食行程與熱門景點周邊餐廳。",
    path: `/destinations/${slug}`
  });
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destination = await getPublicDestinationBySlugData(slug);
  if (!destination) notFound();
  const [tours, restaurants, attractions] = await Promise.all([getPublicToursData(), getPublicRestaurantsData(), getPublicAttractionsData()]);
  const cityTours = tours.filter((tour) => tour.destination_id === destination.id);
  const cityRestaurants = restaurants.filter((item) => item.destination_id === destination.id);
  const cityAttractions = attractions.filter((item) => item.destination_id === destination.id);

  return (
    <main>
      <section
        className="h-96 bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(25,30,24,.82), rgba(25,30,24,.18)), url(${destination.cover_image_url})` }}
      >
        <div className="mx-auto flex h-full max-w-7xl items-end px-4 py-10 text-white">
          <div>
            <h1 className="text-5xl font-semibold">{destination.city} 美食地圖</h1>
            <p className="mt-3 text-white/85">餐廳、咖啡廳、在地小吃與 AI 順路行程。</p>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10">
        <Group title="推薦餐廳">
          <div className="grid gap-4 md:grid-cols-3">{cityRestaurants.map((item) => <RestaurantCard key={item.id} restaurant={item} />)}</div>
        </Group>
        <Group title="AI 美食行程">
          <div className="grid gap-4 md:grid-cols-3">{cityTours.map((tour) => <TourCard key={tour.id} tour={tour} />)}</div>
        </Group>
        <Group title="美食周邊景點">
          <div className="grid gap-4 md:grid-cols-3">{cityAttractions.map((item) => <AttractionCard key={item.id} attraction={item} />)}</div>
        </Group>
      </section>
    </main>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}
