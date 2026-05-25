import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function SEOFields() {
  return (
    <div className="grid gap-3">
      <Input name="seo_title" placeholder="SEO title" />
      <Textarea name="seo_description" placeholder="SEO description" />
      <Input name="canonical_url" placeholder="Canonical URL" />
    </div>
  );
}
