import type { Metadata } from "next";
import { PageIntro, ButtonLink, FinalCta } from "@/components/ui";
import { Reveal } from "@/components/animations/reveal";
import { getMessages } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/routing";
import { pageContext, type LocaleParams } from "@/lib/page";
import { pageMetadata } from "@/lib/metadata";
import { darkEnabled } from "@/lib/theme";
import styles from "./about.module.css";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale).about.meta;
  return pageMetadata(locale, t.title, t.description, { pathname: "/sobre" });
}

export default async function AboutPage({ params }: LocaleParams) {
  const { m, contactHref } = await pageContext(params);
  const a = m.about;
  return <>
    <PageIntro eyebrow={a.eyebrow} title={a.title} description={a.description} />
    <section className={`container ${styles.opening}`}><Reveal><div className={styles.identity}><span className={styles.identityLabel}>{a.identityLabel}</span>{/* SVG oficial: next/image não otimiza SVG. */}{/* eslint-disable-next-line @next/next/no-img-element */}
<img className={darkEnabled ? "logo-light" : undefined} src="/brand/nexya-logo-claro.svg" alt={a.logoAlt} width={520} height={94} loading="lazy" />{darkEnabled && <img className="logo-dark" src="/brand/nexya-logo-escuro.svg" alt={a.logoAlt} width={520} height={94} loading="lazy" />}<div className={styles.identityFooter}><span>{a.identityFooter}</span><span aria-hidden="true">+ &nbsp; +</span></div></div></Reveal><div className={styles.introCopy}><h2>{a.introTitle1}<br />{a.introTitle2}</h2>{a.intro.map((p) => <p key={p}>{p}</p>)}<ButtonLink href="/solucoes" variant="text">{a.explore}</ButtonLink></div></section>
    <section className={styles.principles}><div className="container"><div className={styles.principlesHead}><p className="eyebrow">{a.principlesEyebrow}</p><h2>{a.principlesTitle}</h2></div><div className={styles.principleGrid}>{a.principles.map((principle, index) => <Reveal key={principle.title} delay={(index % 2) * .07}><div className={styles.principle}><span>0{index + 1}</span><h3>{principle.title}</h3><p>{principle.text}</p></div></Reveal>)}</div></div></section>
    <section className={`container ${styles.product}`}><div><p className="eyebrow">{a.productEyebrow}</p><h2>{a.productTitle}</h2></div><div><p>{a.productText1}</p><p>{a.productText2}</p><ButtonLink href="/nexya-auto" variant="secondary">{a.productButton}</ButtonLink></div></section>
    <FinalCta m={m.finalCta} href={contactHref} newTabLabel={m.a11y.newTab} />
  </>;
}
