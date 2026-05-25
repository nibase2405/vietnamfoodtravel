import { requireApiAdmin } from "@/lib/api/guards";

export async function GET() {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
  if (error) return new Response(error.message, { status: 400 });
  const rows = data ?? [];
  const columns = ["id", "booking_type", "travel_date", "people_count", "total_amount", "currency", "status", "payment_status", "contact_name", "contact_phone", "contact_email", "created_at"];
  const csv = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => JSON.stringify(row[column] ?? "")).join(","))
  ].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bookings-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  });
}
