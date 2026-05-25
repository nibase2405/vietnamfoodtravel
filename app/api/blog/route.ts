import { NextResponse } from "next/server";
import { jsonBody, requireApiAdmin } from "@/lib/api/guards";
import { pickBlogPayload } from "@/lib/api/blog-payload";
import { getPublicBlogPostsData } from "@/lib/data/queries";

export async function GET() {
  return NextResponse.json(await getPublicBlogPostsData());
}

export async function POST(request: Request) {
  const { supabase, user, response } = await requireApiAdmin();
  if (response) return response;
  const payload = pickBlogPayload({ ...(await jsonBody(request)), author_id: user?.id });
  const { data, error } = await supabase.from("blog_posts").insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
