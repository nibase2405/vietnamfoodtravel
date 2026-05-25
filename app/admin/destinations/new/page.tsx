import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DestinationForm } from "@/components/forms/DestinationForm";

export default function AdminNewDestinationPage() {
  return <section><AdminPageHeader title="新增目的地" /><div className="mt-6 rounded-lg border bg-white p-5"><DestinationForm /></div></section>;
}
