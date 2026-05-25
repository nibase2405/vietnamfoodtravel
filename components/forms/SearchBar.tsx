import Link from "next/link";
import { MapPin, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { localizeHref, type SupportedLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils/cn";

const examples = [
  "/food-map?city=Ho+Chi+Minh+City&cuisine=越南河粉",
  "/food-map?district=District+7&q=火鍋",
  "/food-map?city=Da+Nang&cuisine=海鮮",
  "/food-map?city=Hanoi&cuisine=咖啡"
];
const searchInputClass = "text-slate-800 caret-slate-800 placeholder:text-slate-500";
const selectClass = "h-10 w-full rounded-md border bg-background px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-ring";

const cityOptions = [
  "",
  "Ho Chi Minh City",
  "Hanoi",
  "Da Nang",
  "Hoi An"
];

const cuisineOptions = [
  "",
  "越南河粉",
  "越南法國麵包",
  "咖啡",
  "海鮮",
  "火鍋",
  "燒烤",
  "甜點"
];

const priceOptions = [
  "",
  "low",
  "medium",
  "high",
  "luxury"
];

const ratingOptions = ["", "4.5", "4.0"];

const openOptions = ["", "true", "false"];

const sortOptions = ["", "most_booked", "local_most_booked", "most_viewed"];

export function SearchBar({ locale }: { locale: SupportedLocale }) {
  const dict = getDictionary(locale);

  return (
    <div className="rounded-lg bg-white p-3 shadow-lg">
      <form action={localizeHref(locale, "/food-map")} className="grid gap-3">
        <div className="grid gap-2 md:grid-cols-[1.45fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" placeholder={dict.search.placeholder} className={`${searchInputClass} pl-9`} />
          </div>
          <Button className="md:min-w-32">
            <Sparkles className="h-4 w-4" />
            {dict.search.button}
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField name="city" values={cityOptions} labels={dict.search.cities} icon="map" />
          <SelectField name="cuisine" values={cuisineOptions} labels={dict.search.cuisines} />
          <SelectField name="price_range" values={priceOptions} labels={dict.search.prices} />
          <SelectField name="min_rating" values={ratingOptions} labels={dict.search.ratings} />
          <SelectField name="open" values={openOptions} labels={dict.search.openStatus} />
          <SelectField name="sort" values={sortOptions} labels={dict.search.sort} />
        </div>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {dict.search.quickFilters}
        </span>
        {examples.map((href, index) => (
          <Link key={href} href={localizeHref(locale, href)} className="rounded-md bg-secondary px-2 py-1 text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground">
            {dict.search.examples[index]}
          </Link>
        ))}
      </div>
    </div>
  );
}

function SelectField({ name, values, labels, icon }: { name: string; values: string[]; labels: string[]; icon?: "map" }) {
  return (
    <div className="relative">
      {icon === "map" ? <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /> : null}
      <select name={name} defaultValue="" aria-label={labels[0] ?? name} className={cn(selectClass, icon === "map" && "pl-9")}>
        {values.map((value, index) => (
          <option key={`${name}-${value || "all"}`} value={value}>
            {labels[index] ?? value}
          </option>
        ))}
      </select>
    </div>
  );
}
