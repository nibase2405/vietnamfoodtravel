import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({ title: "聯絡我們", description: "聯絡 Vietnam Travel Platform。", path: "/contact" });

export default function ContactPage() {
  return <main className="mx-auto max-w-3xl px-4 py-12"><h1 className="text-3xl font-semibold">聯絡我們</h1><form className="mt-6 grid gap-3 rounded-lg border bg-white p-5"><Input placeholder="姓名" /><Input placeholder="Email" /><Textarea placeholder="訊息" /><Button>送出</Button></form></main>;
}
