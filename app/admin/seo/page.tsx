import { SEOPageForm } from "@/components/forms/SEOPageForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminSEOPage() {
  return <section><AdminPageHeader title="SEO 管理" description="管理 seo_pages、canonical、og image、schema_json 與 hreflang。" /><div className="mt-6 rounded-lg border bg-white p-5"><SEOPageForm /></div></section>;
}
