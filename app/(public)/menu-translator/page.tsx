import { Camera, ShieldAlert, Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MenuTranslatorDemo } from "@/components/ai/MenuTranslatorDemo";
import { getPublicPageCopy } from "@/lib/i18n/public-page-copy";
import { getCurrentLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const copy = getPublicPageCopy(await getCurrentLocale()).menuTranslator;
  return pageMetadata({ title: copy.title, description: copy.description, path: "/menu-translator" });
}

export default async function MenuTranslatorPage() {
  const copy = getPublicPageCopy(await getCurrentLocale()).menuTranslator;
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="max-w-3xl">
        <Badge className="bg-primary text-primary-foreground">AI Menu OCR</Badge>
        <h1 className="mt-4 text-4xl font-semibold">{copy.heading}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{copy.intro}</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Feature icon={Camera} title={copy.features[0][0]} text={copy.features[0][1]} />
        <Feature icon={Utensils} title={copy.features[1][0]} text={copy.features[1][1]} />
        <Feature icon={ShieldAlert} title={copy.features[2][0]} text={copy.features[2][1]} />
      </div>

      <div className="mt-8">
        <MenuTranslatorDemo />
      </div>
    </main>
  );
}

function Feature({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <Icon className="h-6 w-6 text-primary" />
      <div className="mt-3 font-semibold">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{text}</div>
    </div>
  );
}
