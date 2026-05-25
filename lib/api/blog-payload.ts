const blogColumns = [
  "title",
  "slug",
  "category",
  "tags",
  "cover_image_url",
  "excerpt",
  "content",
  "author_id",
  "status",
  "published_at",
  "seo_title",
  "seo_description",
  "canonical_url"
];

export function pickBlogPayload(payload: Record<string, any>) {
  const next = Object.fromEntries(Object.entries(payload).filter(([key]) => blogColumns.includes(key)));
  if (typeof next.tags === "string") {
    next.tags = next.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean);
  }
  if (typeof next.content === "string") {
    next.content = { blocks: [{ type: "paragraph", text: next.content }] };
  }
  if (next.status === "published" && !next.published_at) {
    next.published_at = new Date().toISOString();
  }
  return next;
}
