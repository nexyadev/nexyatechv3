import type { Metadata } from "next";
import { ArrowDown, ArrowUpRight, Check, MoveUpRight } from "lucide-react";
import { InlineLogo } from "@/components/brand/inline-logo";
import { HeroDevices } from "@/components/home/hero-devices";
import { HeroTitle } from "@/components/home/hero-title";
import { ProcessRail } from "@/components/home/process-rail";
import { Reveal } from "@/components/animations/reveal";
import { TextReveal } from "@/components/animations/text-reveal";
import { MagneticLink } from "@/components/animations/magnetic-link";
import { ButtonLink, FinalCta, SectionHeading } from "@/components/ui";
import { SolutionCard } from "@/components/solution-card";
import { ProductDiagram } from "@/components/product/product-diagram";
import { Link } from "@/i18n/navigation";
import { solutionKeys, solutionSlug, isLocale } from "@/i18n/routing";
import { getMessages } from "@/i18n/dictionaries";
import { pageContext, type LocaleParams } from "@/lib/page";
import { pageMetadata } from "@/lib/metadata";
import { kindBySlug } from "@/components/solutions/solution-art";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getMessages(locale).home.meta;
  return pageMetadata(locale, m.title, m.description, { pathname: "/" });
}

export default async function Home({ params }: LocaleParams) {
  const { locale, m, contactHref } = await pageContext(params);
  const h = m.home;
  const external = contactHref.startsWith("https") ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return <>
    <section className="hero container" aria-labelledby="hero-title">
      <div className="hero-copy">
        <InlineLogo className="hero-logo" intro label={h.logoLabel} />
        <HeroTitle id="hero-title" text={h.title} />
        <p className="hero-sub">{h.sub}</p>
        <div className="hero-actions">
          <MagneticLink href={contactHref} className="button button-primary" {...external}>{h.primary} <ArrowUpRight size={18} aria-hidden="true" /></MagneticLink>
          <ButtonLink href="/projetos" variant="secondary">{h.secondary}</ButtonLink>
        </div>
      </div>
      <HeroDevices alt={h.devicesAlt} caption={h.devicesCaption} />
      <a href="#manifesto" className="hero-hook"><span className="hero-hook-line" aria-hidden="true" />{h.hook}</a>
    </section>

    <section id="manifesto" className="manifesto container section" aria-labelledby="manifesto-title">
      <div className="manifesto-aside"><p className="eyebrow">{h.manifestoEyebrow}</p><MoveUpRight size={50} strokeWidth={0.75} aria-hidden="true" /></div>
      <div className="manifesto-main"><h2 id="manifesto-title"><TextReveal text={h.manifesto} /></h2><div className="manifesto-caption"><span className="tiny-cross" aria-hidden="true">+</span><p>{h.manifestoCaption1}<br />{h.manifestoCaption2}</p><Link href="/sobre" className="round-link" aria-label={h.manifestoAria}><ArrowUpRight size={22} aria-hidden="true" /></Link></div></div>
    </section>

    <section id="servicos" className="solutions-section section container" aria-labelledby="solutions-heading">
      <Reveal><div className="section-heading"><div><p className="eyebrow">{h.solutionsEyebrow}</p><h2 id="solutions-heading">{h.solutionsTitle1}<br /><span className="muted">{h.solutionsTitle2}</span></h2></div><p>{h.solutionsAside1}<br />{h.solutionsAside2}</p></div></Reveal>
      <Reveal><div className="solutions-grid">
        {solutionKeys.map((key, i) => <SolutionCard key={key} featured={i === 0} index={String(i + 1).padStart(2, "0")} slug={solutionSlug(locale, key)} kind={kindBySlug[key]} title={h.cards[key].title} description={h.cards[key].text} />)}
      </div></Reveal>
      <div className="solutions-bottom"><span>{h.solutionsBottom}</span><ButtonLink href="/solucoes" variant="text">{h.solutionsAll}</ButtonLink></div>
    </section>

    <section id="produto" className="product-section section" aria-labelledby="product-heading"><div className="container">
      <div className="product-topline"><p className="eyebrow">{h.productEyebrow}</p><span className="product-badge"><span />{h.productBadge}</span></div>
      <div className="home-product-grid"><div className="home-product-copy"><p className="product-wordmark">NEXYA <span>AUTO</span></p><h2 id="product-heading">{h.productTitle1}<br />{h.productTitle2}<br /><span className="muted">{h.productTitle3}</span></h2><p>{h.productText}</p><ul className="product-checks">{h.productChecks.map((item) => <li key={item}><Check size={14} aria-hidden="true" />{item}</li>)}</ul><ButtonLink href="/nexya-auto">{h.productButton}</ButtonLink></div><div className="home-product-visual"><ProductDiagram compact m={m.product} /></div></div>
      {/* Gancho para a próxima seção (Processo); a antiga seção de projetos saiu da Home. */}
      <div className="product-bottomline"><span>{h.productBottom}</span><a href="#processo">{h.productBottomLink} <ArrowDown size={16} aria-hidden="true" /></a></div>
    </div></section>

    <section id="processo" className="section container home-process" aria-label={h.processAria}><Reveal><SectionHeading eyebrow={h.processEyebrow} title={h.processTitle} description={h.processDescription} /></Reveal><ProcessRail steps={h.processSteps} /><ButtonLink href="/processo" variant="text">{h.processLink}</ButtonLink></section>
    <FinalCta m={m.finalCta} href={contactHref} newTabLabel={m.a11y.newTab} />
  </>;
}
