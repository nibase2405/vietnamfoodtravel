import Link from "next/link";
import { ArrowRight, HeartPulse, Languages, MapPinned, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MedicalClinicList } from "@/components/medical/MedicalClinicList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPublicMedicalClinicsData } from "@/lib/data/queries";
import { localizeHref } from "@/lib/i18n/config";
import { getPublicPageCopy } from "@/lib/i18n/public-page-copy";
import { getCurrentLocale } from "@/lib/i18n/server";
import { medicalClinicCategories, medicalClinicCities, medicalClinicLanguages } from "@/lib/medical-clinics";
import { pageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

export async function generateMetadata() {
  const copy = getPublicPageCopy(await getCurrentLocale()).medical;
  return pageMetadata({ title: copy.title, description: copy.description, path: "/medical-clinics" });
}

export default async function MedicalClinicsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const locale = await getCurrentLocale();
  const copy = getPublicPageCopy(locale).medical;
  const params = await searchParams;
  const clinics = await getPublicMedicalClinicsData(params);

  return (
    <main>
      <section className="border-b bg-secondary/45">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col justify-center">
            <Badge className="w-fit bg-primary text-primary-foreground">{copy.badge}</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal md:text-5xl">{copy.heading}</h1>
            <p className="mt-5 max-w-2xl leading-8 text-muted-foreground">
              {copy.intro}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="#clinic-list">
                  {copy.view}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={localizeHref(locale, "/contact")}>{copy.update}</Link>
              </Button>
            </div>
          </div>
          <div className="min-h-[360px] overflow-hidden rounded-lg bg-muted">
            <img
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d"
              alt={copy.imageAlt}
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 md:grid-cols-3">
          <Feature icon={HeartPulse} title={copy.features[0][0]} description={copy.features[0][1]} />
          <Feature icon={Languages} title={copy.features[1][0]} description={copy.features[1][1]} />
          <Feature icon={MapPinned} title={copy.features[2][0]} description={copy.features[2][1]} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <form action={localizeHref(locale, "/medical-clinics")} className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr_auto]">
          <Input name="q" placeholder={copy.search} />
          <select name="city" defaultValue="" aria-label={copy.allCities} className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="">{copy.allCities}</option>
            {medicalClinicCities.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
          <select name="category" defaultValue="" aria-label={copy.allCategories} className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="">{copy.allCategories}</option>
            {medicalClinicCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <select name="language" defaultValue="" aria-label={copy.allLanguages} className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="">{copy.allLanguages}</option>
            {medicalClinicLanguages.map((language) => <option key={language} value={language}>{language}</option>)}
          </select>
          <select name="emergency" defaultValue="" aria-label={copy.emergency} className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
            <option value="">{copy.emergencyAny}</option>
            <option value="true">{copy.emergency}</option>
          </select>
          <Button>
            <ShieldCheck className="h-4 w-4" />
            {copy.filter}
          </Button>
        </form>
      </section>

      <section id="clinic-list" className="mx-auto max-w-7xl px-4 pb-14">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">{copy.listTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{copy.note}</p>
        </div>
        <MedicalClinicList initialClinics={clinics} />
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-secondary text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
      </span>
    </div>
  );
}
