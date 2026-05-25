const seoColumns = ["path", "language_code", "title", "description", "og_image_url", "schema_json", "hreflang"];

export function pickSeoPayload(payload: Record<string, any>) {
  const next = Object.fromEntries(Object.entries(payload).filter(([key]) => seoColumns.includes(key)));
  if (typeof next.schema_json === "string") {
    try {
      next.schema_json = JSON.parse(next.schema_json);
    } catch {
      next.schema_json = {};
    }
  }
  if (typeof next.hreflang === "string") {
    try {
      next.hreflang = JSON.parse(next.hreflang);
    } catch {
      next.hreflang = {};
    }
  }
  return next;
}
