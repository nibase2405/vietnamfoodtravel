import Link from "next/link";
import { BookOpen, Bot, Camera, HeartPulse, Home, Landmark, MapPinned, Menu, Search, Sparkles, Trophy, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { localizeHref, type SupportedLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function SiteHeader({ locale }: { locale: SupportedLocale }) {
  const dict = getDictionary(locale);
  const featureLabels: Record<SupportedLocale, { cityGuides: string; rankings: string; kols: string }> = {
    "zh-tw": { cityGuides: "城市攻略", rankings: "排行榜", kols: "KOL 推薦" },
    "zh-cn": { cityGuides: "城市攻略", rankings: "排行榜", kols: "KOL 推荐" },
    en: { cityGuides: "City Guides", rankings: "Rankings", kols: "KOL Picks" },
    vi: { cityGuides: "Cẩm nang thành phố", rankings: "Xếp hạng", kols: "KOL gợi ý" },
    ko: { cityGuides: "도시 가이드", rankings: "랭킹", kols: "KOL 추천" },
    ja: { cityGuides: "都市ガイド", rankings: "ランキング", kols: "KOLおすすめ" }
  };
  const nav = [
    [dict.nav.foodMap, "/food-map"],
    [featureLabels[locale].cityGuides, "/city-guides"],
    [featureLabels[locale].rankings, "/rankings"],
    [featureLabels[locale].kols, "/kol-recommendations"],
    [dict.nav.attractions, "/attractions"],
    [dict.nav.medicalClinics, "/medical-clinics"],
    [dict.nav.aiRecommendation, "/ai-food-assistant"],
    [dict.nav.foodTrip, "/ai-trip-planner"],
    [dict.nav.menuTranslator, "/menu-translator"],
    [dict.nav.services, "/services"],
    [dict.nav.merchant, "/merchant"]
  ];
  const mobileNav: Array<[string, string, LucideIcon]> = [
    [dict.nav.home, "/", Home],
    [dict.nav.map, "/food-map", MapPinned],
    [featureLabels[locale].cityGuides, "/city-guides", BookOpen],
    [featureLabels[locale].rankings, "/rankings", Trophy],
    [featureLabels[locale].kols, "/kol-recommendations", Sparkles],
    [dict.nav.attractions, "/attractions", Landmark],
    [dict.nav.medical, "/medical-clinics", HeartPulse],
    [dict.common.ai, "/ai-food-assistant", Bot],
    [dict.nav.member, "/dashboard", User]
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/92 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href={localizeHref(locale, "/")} className="flex items-center gap-2 text-lg font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <MapPinned className="h-5 w-5" />
            </span>
            <span>VietFood Map</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {nav.map(([label, href]) => (
              <Link key={href} href={localizeHref(locale, href)} className="text-muted-foreground hover:text-foreground">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button asChild variant="outline" className="hidden md:inline-flex">
              <Link href={localizeHref(locale, "/menu-translator")}>
                <Camera className="h-4 w-4" />
                {dict.nav.menuTranslator}
              </Link>
            </Button>
            <Button asChild className="hidden md:inline-flex">
              <Link href={localizeHref(locale, "/food-map")}>
                <Search className="h-4 w-4" />
                {dict.nav.startExplore}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label={dict.nav.openMenu}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-9 border-t bg-card/95 px-1 py-1 shadow-lg backdrop-blur md:hidden">
        {mobileNav.map(([label, href, Icon]) => (
          <Link key={href} href={localizeHref(locale, href)} className="grid place-items-center gap-0.5 rounded-md px-1 py-1.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground">
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
