import { redirect } from "next/navigation";
import { isSupportedLocale } from "@/lib/i18n/config";

export default async function LocaleEntryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) redirect("/");
  redirect("/");
}
