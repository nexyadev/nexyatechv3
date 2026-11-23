import { ArrowUpRight, Copyright } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getMessages } from "@/i18n/dictionaries";
import { solutionKeys, solutionSlug, type Locale } from "@/i18n/routing";
import { siteConfig } from "@/lib/config";
import { LanguageLinks } from "@/components/i18n/language-switcher";
import { MotionToggle } from "@/components/layout/motion-toggle";
import { darkEnabled } from "@/lib/theme";

/** Rodapé no idioma da página. O símbolo de copyright é SVG (nunca o caractere, que pode virar emoji). */
export function Footer({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  const f = m.footer;
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Link href="/" aria-label={m.nav.homeAria}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={darkEnabled ? "logo-light" : undefined} src="/brand/nexya-logo-claro.svg" alt={f.logoAlt} width={210} height={38} loading="lazy" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {darkEnabled && <img className="logo-dark" src="/brand/nexya-logo-escuro.svg" alt={f.logoAlt} width={210} height={38} loading="lazy" />}
          </Link>
          <p>{f.tagline}</p>
        </div>
        <div className="footer-links"><h2>{f.explore}</h2><Link href="/sobre">{f.aboutLink}</Link><Link href="/projetos">{f.projectsLink}</Link><Link href="/processo">{f.processLink}</Link><Link href="/contato">{f.contactLink}</Link></div>
        <div className="footer-links"><h2>{f.solutions}</h2>{solutionKeys.map((key) => <Link key={key} href={{ pathname: "/solucoes/[slug]", params: { slug: solutionSlug(locale, key) } }}>{m.solutions[key].title}</Link>)}<Link href="/nexya-auto">NEXYA Auto</Link></div>
        <div className="footer-links"><h2>{f.connect}</h2>{siteConfig.socials.map((social) => <a href={social.url} key={social.url} target="_blank" rel="noopener noreferrer">{social.label.replace("Instagram · ", "Instagram ")} <ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only">{m.a11y.newTab}</span></a>)}<Link href="/privacidade">{f.privacy}</Link></div>
      </div>
      <div className="container footer-bottom">
        <span className="footer-copy"><Copyright size={13} strokeWidth={1.5} aria-hidden="true" /><span className="sr-only">{f.copyright}</span> {new Date().getFullYear()} {f.rights}</span>
        <div className="footer-tools"><MotionToggle /><LanguageLinks /></div>
      </div>
    </footer>
  );
}
