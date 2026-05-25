import { CustomTripRequestForm } from "@/components/forms/CustomTripRequestForm";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({ title: "客製越南旅行詢問", description: "填寫日期、人數、城市、預算與語言需求，由專人回覆。", path: "/custom-trip" });

export default function CustomTripPage() {
  return <main className="mx-auto max-w-5xl px-4 py-10"><h1 className="text-3xl font-semibold">客製旅行表單</h1><p className="mt-3 text-muted-foreground">送出後會建立 custom_trip_requests，Admin 後台可追蹤狀態。</p><div className="mt-6 rounded-lg border bg-white p-5"><CustomTripRequestForm /></div></main>;
}
