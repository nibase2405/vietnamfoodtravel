import { TranslationFields } from "@/components/forms/TranslationFields";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminTranslationsPage() {
  return <section><AdminPageHeader title="多語系管理" description="依 entity_type 篩選，編輯 zh-TW / zh-CN / en / vi 並顯示缺漏翻譯。" /><div className="mt-6 grid gap-4 rounded-lg border bg-white p-5"><TranslationFields language="zh-TW" /><TranslationFields language="zh-CN" /><TranslationFields language="en" /><TranslationFields language="vi" /></div></section>;
}
