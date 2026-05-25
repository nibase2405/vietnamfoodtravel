const proposalColumns = ["request_id", "admin_id", "title", "itinerary", "quoted_price", "currency", "pdf_url", "status"];

export function pickCustomTripProposalPayload(payload: Record<string, any>) {
  const next = Object.fromEntries(Object.entries(payload).filter(([key]) => proposalColumns.includes(key)));
  if (typeof next.itinerary === "string") {
    try {
      next.itinerary = JSON.parse(next.itinerary);
    } catch {
      next.itinerary = { days: [] };
    }
  }
  return next;
}
