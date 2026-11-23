import type { MetadataRoute } from "next";
import { defaultLocale, locales, solutionKeys, solutionSlug } from "@/i18n/routing";
import { caseSlugs } from "@/lib/portfolio/projects";
import { absoluteUrl, localizedPath, type RouteRef } from "@/lib/metadata";

/** Uma entrada por página e idioma, com alternates (hreflang) para as 3 versões + x-default. */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes: (RouteRef & { priority: number })[] = [
    { pathname: "/", priority: 1 },
    { pathname: "/solucoes", priority: .8 },
    ...solutionKeys.map((key) => ({ pathname: "/solucoes/[slug]" as const, params: (l: (typeof locales)[number]) => ({ slug: solutionSlug(l, key) }), priority: .7 })),
    { pathname: "/nexya-auto", priority: .8 },
    { pathname: "/projetos", priority: .8 },
    ...caseSlugs.map((slug) => ({ pathname: "/projetos/[slug]" as const, params: { slug }, priority: .6 })),
    { pathname: "/sobre", priority: .6 },
    { pathname: "/processo", priority: .6 },
    { pathname: "/contato", priority: .7 },
    { pathname: "/privacidade", priority: .3 },
  ];
  return routes.flatMap((route) => {
    const languages: Record<string, string> = Object.fromEntries(locales.map((l) => [l, absoluteUrl(localizedPath(l, route))]));
    languages["x-default"] = absoluteUrl(localizedPath(defaultLocale, route));
    return locales.map((locale) => ({ url: absoluteUrl(localizedPath(locale, route)), changeFrequency: "monthly" as const, priority: route.priority, alternates: { languages } }));
  });
}
