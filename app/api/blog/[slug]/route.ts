import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";
import { pickBlogPayload } from "@/lib/api/blog-payload";
import { getPublicBlogPostBySlugData } from "@/lib/data/queries";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPublicBlogPostBySlugData(slug);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const { slug } = await params;
  const { data, error } = await supabase.from("blog_posts").update(pickBlogPayload(await jsonBody(request))).eq("slug", slug).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const { slug } = await params;
  const { error } = await supabase.from("blog_posts").delete().eq("slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
