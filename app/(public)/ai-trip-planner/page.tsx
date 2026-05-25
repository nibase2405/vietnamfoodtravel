import { Bot, Route, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AITripPlannerForm } from "@/components/forms/AITripPlannerForm";
import { Badge } from "@/components/ui/badge";
import { getPublicPageCopy } from "@/lib/i18n/public-page-copy";
import { getCurrentLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const copy = getPublicPageCopy(await getCurrentLocale()).aiTrip;
  return pageMetadata({ title: copy.title, description: copy.description, path: "/ai-trip-planner" });
}

export default async function AITripPlannerPage() {
  const copy = getPublicPageCopy(await getCurrentLocale()).aiTrip;
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="max-w-3xl">
        <Badge className="bg-primary text-primary-foreground">AI Itinerary</Badge>
        <h1 className="mt-4 text-4xl font-semibold">{copy.heading}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{copy.intro}</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Feature icon={Bot} title={copy.features[0][0]} text={copy.features[0][1]} />
        <Feature icon={Route} title={copy.features[1][0]} text={copy.features[1][1]} />
        <Feature icon={WalletCards} title={copy.features[2][0]} text={copy.features[2][1]} />
      </div>

      <div className="mt-8">
        <AITripPlannerForm />
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
