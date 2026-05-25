import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublicBlogPostBySlugData } from "@/lib/data/queries";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlugData(slug);
  return pageMetadata({
    title: post?.seo_title ?? post?.title ?? "美食攻略",
    description: post?.seo_description ?? post?.excerpt ?? "越南美食攻略、餐廳推薦與自由行路線。",
    path: `/blog/${slug}`
  });
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlugData(slug);
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <img src={post.cover_image_url ?? ""} alt="" className="mb-8 h-80 w-full rounded-lg object-cover" />
      <div className="text-sm text-muted-foreground">{post.category}</div>
      <h1 className="mt-3 text-4xl font-semibold">{post.title}</h1>
      <p className="mt-5 text-lg text-muted-foreground">{post.excerpt}</p>
      <article className="prose mt-8 max-w-none">
        <p>
          正式版可在 CMS 中編輯城市攻略、分類排行榜、菜單翻譯指南與餐廳推薦文章，並把文章中的餐廳連回地圖與餐廳頁，提高 SEO 與轉換。
        </p>
      </article>
    </main>
  );
}
