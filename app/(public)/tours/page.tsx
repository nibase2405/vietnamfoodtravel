import { FilterSidebar } from "@/components/forms/FilterSidebar";
import { TourCard } from "@/components/cards/TourCard";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublicToursData } from "@/lib/data/queries";

export const metadata = pageMetadata({
  title: "越南美食行程",
  description: "依城市、天數、主題與預算篩選越南美食行程。",
  path: "/tours"
});

export default async function ToursPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = await searchParams;
  const tours = await getPublicToursData(filters);
  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr]">
      <FilterSidebar title="行程篩選" type="tours" />
      <div>
        <h1 className="mb-5 text-3xl font-semibold">越南美食行程</h1>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{tours.map((tour) => <TourCard key={tour.id} tour={tour} />)}</div>
      </div>
    </main>
  );
}
