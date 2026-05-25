import Link from "next/link";
import { Card } from "@/components/ui/card";
import { defaultLocale, localizeHref, type SupportedLocale } from "@/lib/i18n/config";
import type { BlogPost } from "@/types";

export function BlogCard({ post, locale = defaultLocale }: { post: BlogPost; locale?: SupportedLocale }) {
  const coverImage = post.cover_image_url ?? "/placeholder.jpg";

  return (
    <Link href={localizeHref(locale, `/blog/${post.slug}`)}>
      <Card className="overflow-hidden">
        <div className="h-44 overflow-hidden bg-muted">
          <img src={coverImage} alt={post.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </div>
        <div className="p-4">
          <div className="text-xs text-muted-foreground">{post.category}</div>
          <h3 className="mt-2 font-semibold">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
        </div>
      </Card>
    </Link>
  );
}
