import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/api/guards";

export async function POST(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { supabase, response } = await requireApiAdmin();
  if (response) return response;
  const { slug } = await params;
  const { data, error } = await supabase.from("blog_posts").update({ status: "published", published_at: new Date().toISOString() }).eq("slug", slug).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
