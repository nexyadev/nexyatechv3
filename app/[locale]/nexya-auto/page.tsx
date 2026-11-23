import type { Metadata } from "next";
import Image from "next/image";
import { Camera, CarFront, Check, ClipboardCheck, FileText, Users, Workflow } from "lucide-react";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { ProductDiagram } from "@/components/product/product-diagram";
import { Reveal } from "@/components/animations/reveal";
import { getMessages } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/routing";
import { siteConfig, whatsappHref } from "@/lib/config";
import { pageContext, type LocaleParams } from "@/lib/page";
import { pageMetadata } from "@/lib/metadata";
import styles from "@/components/product/product.module.css";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale).nexyaAuto.meta;
  return pageMetadata(locale, t.title, t.description, { pathname: "/nexya-auto" });
}

const benefitIcons = [Users, ClipboardCheck, Camera, FileText];
const railIcons = [Users, CarFront, ClipboardCheck, Camera, FileText];

export default async function NexyaAutoPage({ params }: LocaleParams) {
  const { m } = await pageContext(params);
  const a = m.nexyaAuto;
  const trialHref = siteConfig.trialUrl ?? (siteConfig.whatsappUrl ? whatsappHref(m.whatsapp.default) : "/contato");
  const team = siteConfig.whatsappUrl ? whatsappHref(m.whatsapp.default) : "/contato";
  return <div className={styles.productPage}>
    <section className={styles.productHero}>
      <div className={`container ${styles.heroLayout}`}>
        <div className={styles.heroCopy}>
          <div className={styles.productLabel}>{a.label}</div>
          <h1 className={styles.heroTitle}>{a.title} <span>{a.titleEm}</span></h1>
          <p className={styles.heroDescription}>{a.description}</p>
          <div className={styles.heroActions}><ButtonLink href={trialHref} newTabLabel={m.a11y.newTab}>{a.trial}</ButtonLink><ButtonLink href="#recursos" variant="text">{a.resources}</ButtonLink></div>
          <p className={styles.trialNote}>{a.trialNote}</p>
        </div>
        <ProductDiagram m={m.product} />
      </div>
    </section>
    <div className="container"><div className={styles.featureRail} role="list" aria-label={a.railAria}>{a.rail.map((label, i) => { const Icon = railIcons[i] ?? Check; return <span role="listitem" key={label}><Icon aria-hidden="true" /> {label}</span>; })}</div></div>
    <section className="section container" id="recursos">
      <div className={styles.benefitLayout}>
        <Reveal><div className={styles.benefitIntro}><span className="eyebrow">{a.benefitsEyebrow}</span><h2>{a.benefitsTitle1}<br />{a.benefitsTitle2}</h2><p>{a.benefitsText}</p></div></Reveal>
        <div className={styles.benefitList}>{a.benefits.map(({ title, text }, index) => { const Icon = benefitIcons[index] ?? Check; return <Reveal key={title} delay={index * 0.05}><article className={styles.benefit}><Icon aria-hidden="true" /><div><h3>{title}</h3><p>{text}</p></div></article></Reveal>; })}</div>
      </div>
    </section>
    <section className={`section ${styles.flowSection}`}>
      <div className="container"><SectionHeading eyebrow={a.flowEyebrow} title={a.flowTitle} description={a.flowDescription} /><div className={styles.flowGrid}>{a.flow.map((step, index) => <Reveal key={step.title} delay={index * 0.07}><article className={styles.flowStep}><span className={styles.flowNumber}>0{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p></article></Reveal>)}</div></div>
    </section>
    <section className={`section container ${styles.detailSection}`}>
      <Reveal><figure className={styles.orderFigure}><div className={styles.orderScreen}><Image src="/images/demo/nexya-auto-os.webp" width={1600} height={1000} sizes="(max-width: 900px) 92vw, 52vw" className={styles.orderImage} alt={a.orderAlt} /></div><figcaption>{a.orderCaption}</figcaption></figure></Reveal>
      <Reveal delay={0.1}><div className={styles.detailCopy}><span className="eyebrow">{a.detailEyebrow}</span><h2>{a.detailTitle}</h2><p>{a.detailText}</p><ul className={styles.checkList}>{a.detailChecks.map((item) => <li key={item}><Check aria-hidden="true" /> {item}</li>)}</ul></div></Reveal>
    </section>
    <section className={`section container ${styles.faqLayout}`}>
      <div className={styles.faqIntro}><span className="eyebrow">{a.faqEyebrow}</span><h2>{a.faqTitle}</h2><p>{a.faqText}</p></div>
      <div className={styles.faqList}>{a.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div>
    </section>
    <section className={styles.autoCta}>
      <span className="eyebrow"><Workflow size={14} aria-hidden="true" /> NEXYA AUTO</span><h2>{a.ctaTitle}</h2><p>{a.ctaText}</p><div className={styles.ctaLinks}><ButtonLink href={trialHref} newTabLabel={m.a11y.newTab}>{a.trial}</ButtonLink><ButtonLink href={team} variant="text" newTabLabel={m.a11y.newTab}>{a.ctaTeam}</ButtonLink></div>
    </section>
  </div>;
}
