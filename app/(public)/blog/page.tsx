import { BlogCard } from "@/components/cards/BlogCard";
import { FilterSidebar } from "@/components/forms/FilterSidebar";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublicBlogPostsData } from "@/lib/data/queries";

export const metadata = pageMetadata({
  title: "越南美食攻略",
  description: "越南城市美食攻略、餐廳排行榜、菜單翻譯、價格資訊與自由行路線。",
  path: "/blog"
});

export default async function BlogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const blogPosts = await getPublicBlogPostsData(await searchParams);
  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[280px_1fr]">
      <FilterSidebar title="文章篩選" type="blog" />
      <div>
        <h1 className="mb-6 text-3xl font-semibold">越南美食攻略</h1>
        <div className="grid gap-4 md:grid-cols-3">
          {blogPosts.map((post) => <BlogCard key={post.id} post={post} />)}
        </div>
      </div>
    </main>
  );
}
