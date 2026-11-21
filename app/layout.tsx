import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Preloader } from "@/components/animations/preloader";
import { SiteChrome } from "@/components/layout/site-chrome";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "NEXYA Tech — Tecnologia em movimento", template: "%s | NEXYA Tech" },
  description: "Criamos sistemas, automações e experiências digitais para empresas que querem crescer com tecnologia de verdade.",
  applicationName: "NEXYA Tech",
  icons: { icon: "/images/logo-nexya.png" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#08090b" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>
    <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
    <SiteChrome><Preloader /><Header /></SiteChrome>
    <main id="conteudo" tabIndex={-1}>{children}</main>
    <SiteChrome><Footer /></SiteChrome>
  </body></html>;
}
