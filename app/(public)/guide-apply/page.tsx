import { GuideApplyForm } from "@/components/forms/GuideApplyForm";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({ title: "導遊加入", description: "申請成為越南中文導遊或地陪。", path: "/guide-apply" });

export default function GuideApplyPage() {
  return <main className="mx-auto max-w-5xl px-4 py-10"><h1 className="text-3xl font-semibold">導遊申請表</h1><div className="mt-6 rounded-lg border bg-white p-5"><GuideApplyForm /></div></main>;
}
