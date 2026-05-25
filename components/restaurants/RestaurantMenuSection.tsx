"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageIcon, Leaf, Flame, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MENU_OVERRIDES_STORAGE_KEY, type DisplayMenuItem, formatMenuPrice, normalizeMenuImages, normalizeMenuItems, type RestaurantMenuOverride } from "@/lib/menu";

type RestaurantMenuSectionProps = {
  restaurantSlug: string;
  initialItems: DisplayMenuItem[];
  initialMenuImages: string[];
};

function readOverrides() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(MENU_OVERRIDES_STORAGE_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed as Record<string, RestaurantMenuOverride> : {};
  } catch {
    return {};
  }
}

export function RestaurantMenuSection({ restaurantSlug, initialItems, initialMenuImages }: RestaurantMenuSectionProps) {
  const [items, setItems] = useState(initialItems);
  const [menuImages, setMenuImages] = useState(initialMenuImages);

  useEffect(() => {
    const saved = readOverrides()[restaurantSlug];
    if (!saved) return;
    setItems(normalizeMenuItems(saved.menuItems));
    setMenuImages(normalizeMenuImages(saved.menuImages));
  }, [restaurantSlug]);

  const groupedItems = useMemo(() => {
    return items.reduce<Record<string, DisplayMenuItem[]>>((groups, item) => {
      const category = item.category || "招牌菜";
      groups[category] = [...(groups[category] ?? []), item];
      return groups;
    }, {});
  }, [items]);

  return (
    <section id="menu" className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Utensils className="h-4 w-4" />
            餐廳菜單
          </div>
          <h2 className="mt-1 text-2xl font-semibold">菜單、價格與招牌菜</h2>
        </div>
        <Badge>{items.length} 道菜品</Badge>
      </div>

      {menuImages.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {menuImages.map((image, index) => (
            <a key={`${image}-${index}`} href={image} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-lg border bg-white">
              <img src={image} alt={`菜單照片 ${index + 1}`} loading="lazy" decoding="async" className="h-56 w-full object-cover transition group-hover:scale-[1.02]" />
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                查看菜單照片 {index + 1}
              </div>
            </a>
          ))}
        </div>
      ) : null}

      {items.length ? (
        <div className="grid gap-6">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category} className="grid gap-3">
              <h3 className="text-lg font-semibold">{category}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {categoryItems.map((item) => (
                  <article key={item.id} className="grid gap-3 rounded-lg border bg-white p-4 sm:grid-cols-[96px_1fr]">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} loading="lazy" decoding="async" className="h-24 w-full rounded-md object-cover sm:w-24" />
                    ) : (
                      <div className="grid h-24 place-items-center rounded-md bg-muted text-muted-foreground sm:w-24">
                        <Utensils className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          {item.translatedName ? <p className="mt-0.5 text-sm text-muted-foreground">{item.translatedName}</p> : null}
                        </div>
                        <div className="shrink-0 text-sm font-semibold">{formatMenuPrice(item.price, item.currency)}</div>
                      </div>
                      {item.description ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.description}</p> : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.spicyLevel > 0 ? (
                          <Badge className="bg-red-50 text-red-700">
                            <Flame className="h-3 w-3" />
                            辣度 {item.spicyLevel}/3
                          </Badge>
                        ) : null}
                        {item.isVegetarian ? (
                          <Badge className="bg-primary/10 text-primary">
                            <Leaf className="h-3 w-3" />
                            素食
                          </Badge>
                        ) : null}
                        {item.tags.slice(0, 3).map((tag) => <Badge key={tag}>{tag}</Badge>)}
                        {item.allergens.slice(0, 2).map((allergen) => <Badge key={allergen}>含 {allergen}</Badge>)}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
          目前尚未上傳菜單。管理員可到後台餐廳管理新增菜單照片與菜品價格。
        </div>
      )}
    </section>
  );
}
