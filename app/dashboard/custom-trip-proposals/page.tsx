import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { createClient } from "@/lib/supabase/server";

async function getMyProposals() {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];
    const { data: requests } = await supabase.from("custom_trip_requests").select("id").eq("user_id", auth.user.id);
    const ids = requests?.map((request) => request.id) ?? [];
    if (!ids.length) return [];
    const { data } = await supabase.from("custom_trip_proposals").select("*").in("request_id", ids).order("created_at", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function DashboardCustomTripProposalsPage() {
  const proposals = await getMyProposals();
  return <section><h1 className="mb-6 text-2xl font-semibold">客製報價</h1><AdminDataTable columns={["title", "quoted_price", "currency", "status"]} rows={proposals} /></section>;
}
