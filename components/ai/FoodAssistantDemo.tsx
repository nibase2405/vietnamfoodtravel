"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, MapPin, Navigation, Search, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Restaurant } from "@/types";

const prompts = [
  "我在胡志明市第 1 郡，想吃 20 萬 VND 以內的越南料理",
  "我想帶女朋友吃晚餐，預算 50 萬 VND",
  "幫我找適合台灣人口味的越南餐廳",
  "我不吃牛，想找咖啡廳或小吃",
  "安排河內半天咖啡與在地料理"
];

export function FoodAssistantDemo({ restaurants }: { restaurants: Restaurant[] }) {
  const [query, setQuery] = useState(prompts[0]);
  const [submitted, setSubmitted] = useState(prompts[0]);

  const results = useMemo(() => {
    const text = submitted.toLowerCase();
    const filtered = restaurants.filter((restaurant) => {
      const haystack = [
        restaurant.name,
        restaurant.description,
        restaurant.destinations?.city,
        restaurant.district,
        ...(restaurant.cuisine_type ?? []),
        ...(restaurant.features ?? []),
        ...(restaurant.recommended_dishes ?? [])
      ].join(" ").toLowerCase();
      if (text.includes("咖啡")) return haystack.includes("coffee") || haystack.includes("咖啡");
      if (text.includes("海鮮")) return haystack.includes("seafood") || haystack.includes("海鮮");
      if (text.includes("河粉") || text.includes("越南料理")) return haystack.includes("pho") || haystack.includes("河粉") || haystack.includes("越南料理");
      if (text.includes("河內")) return haystack.includes("hanoi") || haystack.includes("河內");
      if (text.includes("不吃牛")) return !(restaurant.menu_items ?? []).some((item) => item.allergens.includes("牛肉"));
      return true;
    });
    return (filtered.length ? filtered : restaurants).slice(0, 3);
  }, [restaurants, submitted]);

  return (
    <div className="grid gap-5">
      <form
        className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-[1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(query);
        }}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" />
        </div>
        <Button>
          <Sparkles className="h-4 w-4" />
          產生推薦
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => {
              setQuery(prompt);
              setSubmitted(prompt);
            }}
            className="rounded-md border bg-white px-3 py-2 text-left text-xs text-muted-foreground hover:border-primary hover:text-foreground"
          >
            {prompt}
          </button>
        ))}
      </div>

      <section className="rounded-lg border bg-white p-5">
        <div className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-5 w-5 text-primary" />
          AI 推薦結果
        </div>
        <div className="mt-4 grid gap-4">
          {results.map((restaurant) => (
            <article key={restaurant.id} className="grid gap-4 rounded-lg border p-4 md:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/restaurants/${restaurant.slug}`} className="font-semibold hover:underline">
                    {restaurant.name}
                  </Link>
                  {restaurant.sponsored ? <Badge className="bg-accent text-accent-foreground">Sponsored</Badge> : null}
                  {restaurant.is_open ? <Badge className="bg-primary text-primary-foreground">營業中</Badge> : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{restaurant.description}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
                    {restaurant.rating_avg}
                  </span>
                  <span>{restaurant.average_spend}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {restaurant.distance_km} km
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {restaurant.recommended_dishes?.slice(0, 3).map((dish) => <Badge key={dish}>{dish}</Badge>)}
                </div>
              </div>
              <div className="flex flex-wrap items-start gap-2 md:justify-end">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/restaurants/${restaurant.slug}`}>
                    <Heart className="h-4 w-4" />
                    收藏
                  </Link>
                </Button>
                {restaurant.latitude && restaurant.longitude ? (
                  <Button asChild size="sm">
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`} target="_blank" rel="noreferrer">
                      <Navigation className="h-4 w-4" />
                      導航
                    </a>
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
