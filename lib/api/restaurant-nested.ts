const restaurantColumns = [
  "destination_id",
  "name",
  "slug",
  "cuisine_type",
  "price_range",
  "address",
  "latitude",
  "longitude",
  "phone",
  "website_url",
  "google_maps_url",
  "opening_hours",
  "menu_images",
  "cover_image_url",
  "gallery_urls",
  "status",
  "is_featured"
];

export function splitRestaurantPayload(payload: Record<string, any>) {
  const restaurant = Object.fromEntries(Object.entries(payload).filter(([key]) => restaurantColumns.includes(key)));
  return {
    restaurant,
    menuItems: Array.isArray(payload.restaurant_menu_items) ? payload.restaurant_menu_items : []
  };
}

export async function insertRestaurantNested(supabase: any, restaurantId: string, payload: { menuItems?: Record<string, any>[] }) {
  if (!payload.menuItems?.length) return null;
  const { error } = await supabase.from("restaurant_menu_items").insert(payload.menuItems.map((row) => ({ ...row, restaurant_id: restaurantId })));
  return error ?? null;
}

export async function replaceRestaurantNested(supabase: any, restaurantId: string, payload: { menuItems?: Record<string, any>[] }) {
  await supabase.from("restaurant_menu_items").delete().eq("restaurant_id", restaurantId);
  return insertRestaurantNested(supabase, restaurantId, payload);
}
