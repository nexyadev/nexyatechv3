import { defineRouting } from "next-intl/routing";

export const locales = ["pt-BR", "pt-PT", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pt-BR";

/**
 * pt-BR sem prefixo (URLs atuais intactas: SEO e anúncios), pt-PT em /pt-pt, inglês em /en.
 * Sem detecção pelo navegador e sem cookie automático do next-intl: a URL é a fonte da verdade.
 * A preferência explícita fica no cookie funcional "nx_lang", gravado só depois do clique no seletor.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: { mode: "as-needed", prefixes: { "pt-PT": "/pt-pt", en: "/en" } },
  localeDetection: false,
  localeCookie: false,
  alternateLinks: false,
  pathnames: {
    "/": "/",
    "/solucoes": { "pt-BR": "/solucoes", "pt-PT": "/solucoes", en: "/solutions" },
    "/solucoes/[slug]": { "pt-BR": "/solucoes/[slug]", "pt-PT": "/solucoes/[slug]", en: "/solutions/[slug]" },
    "/nexya-auto": "/nexya-auto",
    "/projetos": { "pt-BR": "/projetos", "pt-PT": "/projetos", en: "/projects" },
    "/projetos/[slug]": { "pt-BR": "/projetos/[slug]", "pt-PT": "/projetos/[slug]", en: "/projects/[slug]" },
    "/contato": { "pt-BR": "/contato", "pt-PT": "/contato", en: "/contact" },
    "/privacidade": { "pt-BR": "/privacidade", "pt-PT": "/privacidade", en: "/privacy" },
    "/sobre": { "pt-BR": "/sobre", "pt-PT": "/sobre", en: "/about" },
    "/processo": { "pt-BR": "/processo", "pt-PT": "/processo", en: "/process" },
  },
});

export type AppPathname = keyof typeof routing.pathnames;

/** Slugs de soluções por idioma (português mantém os atuais; inglês usa slugs em inglês). */
export const solutionKeys = ["sistemas", "automacoes", "sites", "integracoes"] as const;
export type SolutionKey = (typeof solutionKeys)[number];
const solutionSlugs: Record<Locale, Record<SolutionKey, string>> = {
  "pt-BR": { sistemas: "sistemas", automacoes: "automacoes", sites: "sites", integracoes: "integracoes" },
  "pt-PT": { sistemas: "sistemas", automacoes: "automacoes", sites: "sites", integracoes: "integracoes" },
  en: { sistemas: "systems", automacoes: "automation", sites: "websites", integracoes: "integrations" },
};
export const solutionSlug = (locale: Locale, key: SolutionKey) => solutionSlugs[locale][key];
export const solutionKeyFromSlug = (locale: Locale, slug: string) => solutionKeys.find((key) => solutionSlugs[locale][key] === slug);

export const isLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);
export const htmlLang: Record<Locale, string> = { "pt-BR": "pt-BR", "pt-PT": "pt-PT", en: "en" };
export const ogLocale: Record<Locale, string> = { "pt-BR": "pt_BR", "pt-PT": "pt_PT", en: "en_US" };
