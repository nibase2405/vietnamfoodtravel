import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { SupportTicketForm } from "@/components/forms/SupportTicketForm";
import { createClient } from "@/lib/supabase/server";

async function getTickets() {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];
    const { data } = await supabase.from("support_tickets").select("*").eq("user_id", auth.user.id).order("created_at", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function DashboardSupportPage() {
  const tickets = await getTickets();
  return <section><h1 className="mb-6 text-2xl font-semibold">客服</h1><SupportTicketForm /><div className="mt-6"><AdminDataTable columns={["subject", "status", "priority", "created_at"]} rows={tickets} /></div></section>;
}
