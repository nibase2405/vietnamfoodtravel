import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SiteSettingsForm } from "@/components/forms/SiteSettingsForm";

async function getSettings() {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const response = await fetch(`${base}/api/settings`, { cache: "no-store" });
    if (!response.ok) return {};
    return response.json();
  } catch {
    return {};
  }
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return <section><AdminPageHeader title="網站設定" description="網站名稱、聯絡方式、LINE、WhatsApp、Zalo、Messenger、幣別與啟用語言。" /><SiteSettingsForm settings={settings} /></section>;
}
