import type { Metadata, Viewport } from "next";
import { Inter, Montserrat, Outfit } from "next/font/google";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import "../globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SatinBackground } from "@/components/background/satin-background";
import { PageTransition } from "@/components/animations/page-transition";
import { CommandPalette } from "@/components/layout/command-palette";
import { SmartCursor } from "@/components/animations/smart-cursor";
import { darkEnabled, themeInitScript } from "@/lib/theme";
import { bandsInitScript, motionInitScript } from "@/lib/motion-script";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { getMessages } from "@/i18n/dictionaries";
import { htmlLang, isLocale, locales, type Locale } from "@/i18n/routing";
import { absoluteUrl, localizedPath } from "@/lib/metadata";
import { siteConfig } from "@/lib/config";

// Outfit variável (eixo wght) para o título que reage ao cursor.
const outfit = Outfit({ subsets: ["latin"], variable: "--font-display", display: "optional" });
const inter = Inter({ subsets: ["latin"], variable: "--font-text", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["500"], variable: "--font-label", display: "swap" });

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getMessages(locale);
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: m.meta.defaultTitle, template: "%s | NEXYA Tech" },
    description: m.meta.defaultDescription,
    applicationName: "NEXYA Tech",
  };
}

export const viewport: Viewport = {
  width: "device-width", initialScale: 1,
  themeColor: darkEnabled ? [{ media: "(prefers-color-scheme: light)", color: "#F4F4F2" }, { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" }] : "#F4F4F2",
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const m = getMessages(locale as Locale);
  const pages = ([
    ["home", m.nav.home, "/"], ["solutions", m.nav.solutions, "/solucoes"], ["projects", m.nav.projects, "/projetos"],
    ["nexya-auto", m.nav.nexyaAuto, "/nexya-auto"], ["contact", m.nav.contact, "/contato"], ["about", m.nav.about, "/sobre"],
    ["process", m.nav.process, "/processo"], ["privacy", m.nav.privacy, "/privacidade"],
  ] as const).map(([key, label, pathname]) => ({ key, label, href: localizedPath(locale, { pathname }) }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": absoluteUrl("/#org"), name: "NEXYA Tech", url: absoluteUrl("/"), logo: absoluteUrl("/brand/nexya-logo-claro.svg"), description: m.meta.orgDescription },
      { "@type": "WebSite", "@id": absoluteUrl(`${localizedPath(locale, { pathname: "/" })}#site`), name: "NEXYA Tech", url: absoluteUrl(localizedPath(locale, { pathname: "/" })), inLanguage: htmlLang[locale], publisher: { "@id": absoluteUrl("/#org") } },
    ],
  };
  const client = { nav: m.nav, motion: m.motion, bands: m.bands, theme: m.theme, lang: m.lang, palette: m.palette, cursor: m.cursor, a11y: m.a11y, whatsapp: m.whatsapp, status: m.status };

  return <html lang={htmlLang[locale]} {...(darkEnabled ? {} : { "data-theme": "light" })} className={`${outfit.variable} ${inter.variable} ${montserrat.variable}`} suppressHydrationWarning><head>
    {/* Marca "com JS" antes do primeiro paint: sem JS, ilustrações e passos aparecem prontos e parados. */}
    <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
    {/* Tema antes do primeiro paint (sem piscar): escolha salva ou prefers-color-scheme. */}
    <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
    {/* Movimento antes do primeiro paint: escolha salva ("nx-motion") ou prefers-reduced-motion. */}
    <script dangerouslySetInnerHTML={{ __html: motionInitScript + ";" + bandsInitScript }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
  </head><body>
    <NextIntlClientProvider locale={locale} messages={{}}><I18nProvider value={{ locale, m: client, pages }}>
      <a href="#conteudo" className="skip-link">{m.nav.skip}</a>
      <SatinBackground />
      <Header />
      <main id="conteudo" tabIndex={-1}><PageTransition>{children}</PageTransition></main>
      <Footer locale={locale} />
      <CommandPalette />
      <SmartCursor />
    </I18nProvider></NextIntlClientProvider>
  </body></html>;
}
