import { TourForm } from "@/components/forms/TourForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminEditTourPage() {
  return <section><AdminPageHeader title="編輯行程" /><div className="mt-6 rounded-lg border bg-white p-5"><TourForm /></div></section>;
}
