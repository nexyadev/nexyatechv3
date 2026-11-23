import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { getMessages } from "@/i18n/dictionaries";
import { getPathname } from "@/i18n/navigation";
import { defaultLocale, locales, ogLocale, type AppPathname, type Locale } from "@/i18n/routing";

/** Rota interna (chave de routing.pathnames) + parâmetros; os parâmetros podem variar por idioma. */
export type RouteRef = { pathname: AppPathname; params?: Record<string, string> | ((locale: Locale) => Record<string, string>) };

export function localizedPath(locale: Locale, route: RouteRef) {
  const params = typeof route.params === "function" ? route.params(locale) : route.params;
  const href = (params ? { pathname: route.pathname, params } : { pathname: route.pathname }) as Parameters<typeof getPathname>[0]["href"];
  return getPathname({ locale, href });
}

export const absoluteUrl = (path: string) => new URL(path, siteConfig.url).toString();

/** Canonical próprio por idioma, hreflang entre as 3 versões + x-default (pt-BR) e og:locale. */
export function pageMetadata(locale: Locale, title: string, description: string, route: RouteRef, siteName = "NEXYA Tech"): Metadata {
  const ogAlt = getMessages(locale).meta.ogAlt;
  const canonical = localizedPath(locale, route);
  const languages: Record<string, string> = Object.fromEntries(locales.map((l) => [l, absoluteUrl(localizedPath(l, route))]));
  languages["x-default"] = absoluteUrl(localizedPath(defaultLocale, route));
  return {
    title: { absolute: `${title} | ${siteName}` },
    description,
    alternates: { canonical: absoluteUrl(canonical), languages },
    openGraph: {
      title: `${title} | ${siteName}`, description, url: absoluteUrl(canonical), siteName,
      locale: ogLocale[locale], alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]), type: "website",
      images: [{ url: absoluteUrl(`/api/og/${locale}`), width: 1200, height: 630, alt: ogAlt }],
    },
    twitter: { card: "summary_large_image", title, description, images: [absoluteUrl(`/api/og/${locale}`)] },
  };
}
