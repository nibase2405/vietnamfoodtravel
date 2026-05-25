import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const supportedLocales = ["zh-tw", "zh-cn", "en", "vi", "ko", "ja"] as const;
type SupportedLocale = (typeof supportedLocales)[number];

const defaultLocale: SupportedLocale = "zh-tw";
const localeCookieName = "vietfood_locale";
const internalLocaleRewriteHeader = "x-vietfood-internal-locale-rewrite";
const protectedPrefixes = ["/dashboard", "/guide-dashboard", "/merchant-dashboard", "/admin"];

function isSupportedLocale(value: string | undefined): value is SupportedLocale {
  return Boolean(value && supportedLocales.includes(value.toLowerCase() as SupportedLocale));
}

function getPathLocale(pathname: string) {
  const segment = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  return isSupportedLocale(segment) ? segment : null;
}

function stripLocale(pathname: string, locale: SupportedLocale) {
  const stripped = pathname.slice(locale.length + 1);
  return stripped ? stripped : "/";
}

function localizedPath(locale: SupportedLocale, pathname: string) {
  return pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
}

function matchBrowserLocale(acceptLanguage: string | null): SupportedLocale {
  if (!acceptLanguage) return defaultLocale;

  const requested = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);

  for (const locale of requested) {
    if (locale.startsWith("zh-cn") || locale.startsWith("zh-sg") || locale.startsWith("zh-hans")) return "zh-cn";
    if (locale.startsWith("zh")) return "zh-tw";
    if (locale.startsWith("vi")) return "vi";
    if (locale.startsWith("ko")) return "ko";
    if (locale.startsWith("ja")) return "ja";
    if (locale.startsWith("en")) return "en";
  }

  return defaultLocale;
}

function getPreferredLocale(request: NextRequest, pathLocale: SupportedLocale | null) {
  if (pathLocale) return pathLocale;
  const cookieLocale = request.cookies.get(localeCookieName)?.value?.toLowerCase();
  if (isSupportedLocale(cookieLocale)) return cookieLocale;
  return matchBrowserLocale(request.headers.get("accept-language"));
}

function setLocaleCookie(response: NextResponse, locale: SupportedLocale) {
  response.cookies.set(localeCookieName, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax"
  });
  return response;
}

function copyResponseCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie.name, cookie.value, cookie);
  });
  return target;
}

function shouldLocalizeRequest(request: NextRequest, pathname: string) {
  if (!["GET", "HEAD"].includes(request.method)) return false;
  if (request.headers.get(internalLocaleRewriteHeader) === "1") return false;
  if (pathname.startsWith("/api")) return false;
  return true;
}

function responseWithLocaleCookies(baseResponse: NextResponse, targetResponse: NextResponse, locale: SupportedLocale) {
  copyResponseCookies(baseResponse, targetResponse);
  return setLocaleCookie(targetResponse, locale);
}

function requestHeadersWithLocale(request: NextRequest, locale: SupportedLocale) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-vietfood-locale", locale);
  return requestHeaders;
}

function requestHeadersForLocalizedRewrite(request: NextRequest, locale: SupportedLocale) {
  const requestHeaders = requestHeadersWithLocale(request, locale);
  requestHeaders.set(internalLocaleRewriteHeader, "1");
  return requestHeaders;
}

export async function proxy(request: NextRequest) {
  const pathLocale = getPathLocale(request.nextUrl.pathname);
  const locale = getPreferredLocale(request, pathLocale);
  const path = pathLocale ? stripLocale(request.nextUrl.pathname, pathLocale) : request.nextUrl.pathname;
  let response = NextResponse.next({ request: { headers: requestHeadersWithLocale(request, locale) } });
  const needsAuthCheck = protectedPrefixes.some((prefix) => path.startsWith(prefix));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (needsAuthCheck && supabaseUrl && supabaseKey) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeadersWithLocale(request, locale) } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    });

    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = localizedPath(locale, "/login");
      loginUrl.searchParams.set("next", localizedPath(locale, path));
      return responseWithLocaleCookies(response, NextResponse.redirect(loginUrl), locale);
    }

    if (data.user && path.startsWith("/admin")) {
      const { data: profile } = await supabase.from("users").select("role").eq("id", data.user.id).single();
      if (!["admin", "super_admin"].includes(profile?.role)) {
        return responseWithLocaleCookies(response, NextResponse.redirect(new URL(localizedPath(locale, "/"), request.url)), locale);
      }
    }

    if (data.user && path.startsWith("/guide-dashboard")) {
      const { data: profile } = await supabase.from("users").select("role").eq("id", data.user.id).single();
      if (!["guide", "admin", "super_admin"].includes(profile?.role)) {
        return responseWithLocaleCookies(response, NextResponse.redirect(new URL(localizedPath(locale, "/"), request.url)), locale);
      }
    }

    if (data.user && path.startsWith("/merchant-dashboard")) {
      const { data: profile } = await supabase.from("users").select("role").eq("id", data.user.id).single();
      if (!["merchant", "admin", "super_admin"].includes(profile?.role)) {
        return responseWithLocaleCookies(response, NextResponse.redirect(new URL(localizedPath(locale, "/"), request.url)), locale);
      }
    }
  }

  if (!pathLocale && shouldLocalizeRequest(request, request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = localizedPath(locale, request.nextUrl.pathname);
    return responseWithLocaleCookies(response, NextResponse.redirect(redirectUrl), locale);
  }

  if (pathLocale) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = path;
    return responseWithLocaleCookies(response, NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeadersForLocalizedRewrite(request, pathLocale) } }), pathLocale);
  }

  return setLocaleCookie(response, locale);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt)$).*)"]
};
