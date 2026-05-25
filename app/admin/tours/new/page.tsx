import { TourForm } from "@/components/forms/TourForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminNewTourPage() {
  return <section><AdminPageHeader title="新增行程" /><div className="mt-6 rounded-lg border bg-white p-5"><TourForm /></div></section>;
}
