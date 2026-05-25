import { BlogPostForm } from "@/components/forms/BlogPostForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { getAdminBlogPostsData } from "@/lib/data/admin";

export default async function AdminBlogPage() {
  const posts = await getAdminBlogPostsData();
  return <section><AdminPageHeader title="Blog 管理" description="草稿、發布、分類、標籤、封面、多語系與 SEO。" /><div className="mt-6 rounded-lg border bg-white p-5"><BlogPostForm /></div><div className="mt-6"><AdminDataTable columns={["title", "slug", "status"]} rows={posts} getActions={(row) => {
    const slug = String(row.slug);
    return [
      { label: "Publish", endpoint: `/api/blog/${slug}/publish` },
      { label: "Draft", endpoint: `/api/blog/${slug}`, method: "PATCH", payload: { status: "draft" } },
      { label: "Archive", endpoint: `/api/blog/${slug}`, method: "PATCH", payload: { status: "archived" }, variant: "outline" },
      { label: "Delete", endpoint: `/api/blog/${slug}`, method: "DELETE", confirm: "Delete this post?", variant: "destructive" }
    ];
  }} /></div></section>;
}
