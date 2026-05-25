"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SiteSettingsForm({ settings }: { settings: Record<string, any> }) {
  const [isPending, startTransition] = useTransition();
  return (
    <form
      className="mt-6 grid max-w-2xl gap-3 rounded-lg border bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const payload = {
          site_name: form.get("site_name"),
          contact_email: form.get("contact_email"),
          line_url: form.get("line_url"),
          whatsapp_url: form.get("whatsapp_url"),
          zalo_url: form.get("zalo_url"),
          messenger_url: form.get("messenger_url"),
          default_currency: form.get("default_currency"),
          enabled_languages: String(form.get("enabled_languages") ?? "").split(",").map((item) => item.trim()).filter(Boolean)
        };
        startTransition(() => {
          void (async () => {
            const response = await fetch("/api/settings", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error("Failed to save settings");
            window.alert("Settings saved");
          })().catch((error) => window.alert(error.message));
        });
      }}
    >
      <Input name="site_name" placeholder="Site name" defaultValue={settings.site_name ?? "Vietnam Travel Platform"} />
      <Input name="contact_email" placeholder="Contact email" defaultValue={settings.contact_email ?? ""} />
      <Input name="line_url" placeholder="LINE" defaultValue={settings.line_url ?? ""} />
      <Input name="whatsapp_url" placeholder="WhatsApp" defaultValue={settings.whatsapp_url ?? ""} />
      <Input name="zalo_url" placeholder="Zalo" defaultValue={settings.zalo_url ?? ""} />
      <Input name="messenger_url" placeholder="Messenger" defaultValue={settings.messenger_url ?? ""} />
      <Input name="default_currency" placeholder="Default currency" defaultValue={settings.default_currency ?? "USD"} />
      <Input name="enabled_languages" placeholder="zh-TW,zh-CN,en,vi" defaultValue={(settings.enabled_languages ?? ["zh-TW", "zh-CN", "en", "vi"]).join(",")} />
      <Button disabled={isPending}>Save settings</Button>
    </form>
  );
}
