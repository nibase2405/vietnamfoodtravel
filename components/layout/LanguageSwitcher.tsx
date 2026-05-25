"use client";

import { usePathname } from "next/navigation";
import { Globe2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { defaultLocale, supportedLocales, type SupportedLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils/cn";

const languages: Array<{ locale: SupportedLocale; label: string; name: string }> = [
  { locale: "zh-tw", label: "繁中", name: "繁體中文" },
  { locale: "zh-cn", label: "简中", name: "简体中文" },
  { locale: "en", label: "EN", name: "English" },
  { locale: "vi", label: "VI", name: "Tiếng Việt" },
  { locale: "ko", label: "KO", name: "한국어" },
  { locale: "ja", label: "JA", name: "日本語" }
];

const switcherLabels: Record<SupportedLocale, string> = {
  "zh-tw": "切換語言",
  "zh-cn": "切换语言",
  en: "Switch language",
  vi: "Đổi ngôn ngữ",
  ko: "언어 변경",
  ja: "言語を切り替え"
};

const localeCookieName = "vietfood_locale";

function getPathParts(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const firstSegment = parts[0]?.toLowerCase();
  const currentLocale = supportedLocales.includes(firstSegment as SupportedLocale) ? (firstSegment as SupportedLocale) : defaultLocale;
  const unlocalizedPath = supportedLocales.includes(firstSegment as SupportedLocale) ? `/${parts.slice(1).join("/")}` : pathname;

  return {
    currentLocale,
    unlocalizedPath: unlocalizedPath === "/" || unlocalizedPath === "" ? "" : unlocalizedPath
  };
}

export function LanguageSwitcher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { currentLocale, unlocalizedPath } = useMemo(() => getPathParts(pathname), [pathname]);
  const currentLanguage = languages.find((language) => language.locale === currentLocale) ?? languages[0];

  useEffect(() => {
    setQuery(window.location.search.replace(/^\?/, ""));

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function switchLanguage(locale: SupportedLocale, href: string) {
    document.cookie = `${localeCookieName}=${locale}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    window.location.assign(href);
  }

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="px-2.5"
        aria-label={switcherLabels[currentLocale]}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Globe2 className="h-4 w-4" />
        <span className="hidden text-xs font-semibold sm:inline">{currentLanguage.label}</span>
      </Button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-sm text-slate-900 shadow-xl">
          {languages.map((language) => {
            const href = `/${language.locale}${unlocalizedPath}${query ? `?${query}` : ""}`;
            const active = language.locale === currentLocale;

            return (
              <a
                key={language.locale}
                href={href}
                className={cn(
                  "flex items-center justify-between gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                  active && "bg-slate-100 font-medium text-slate-950"
                )}
                onClick={(event) => {
                  event.preventDefault();
                  setOpen(false);
                  switchLanguage(language.locale, href);
                }}
              >
                <span>{language.name}</span>
                <span className="text-xs">{language.label}</span>
              </a>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
