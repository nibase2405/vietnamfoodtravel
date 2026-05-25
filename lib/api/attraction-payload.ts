const attractionColumns = [
  "destination_id",
  "name",
  "slug",
  "category",
  "address",
  "latitude",
  "longitude",
  "price_info",
  "opening_hours",
  "cover_image_url",
  "gallery_urls",
  "rating_avg",
  "status"
];

export function pickAttractionPayload(payload: Record<string, any>) {
  return Object.fromEntries(Object.entries(payload).filter(([key]) => attractionColumns.includes(key)));
}
