import type { Metadata } from "next";
import { Check } from "lucide-react";
import { PageIntro, ButtonLink, FinalCta } from "@/components/ui";
import { Reveal } from "@/components/animations/reveal";
import { getMessages } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/routing";
import { pageContext, type LocaleParams } from "@/lib/page";
import { pageMetadata } from "@/lib/metadata";
import styles from "./process.module.css";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale).process.meta;
  return pageMetadata(locale, t.title, t.description, { pathname: "/processo" });
}

export default async function ProcessPage({ params }: LocaleParams) {
  const { m, contactHref } = await pageContext(params);
  const p = m.process;
  return <>
    <PageIntro eyebrow={p.eyebrow} title={p.title} description={p.description} />
    <section className={`container ${styles.timeline}`} aria-label={p.timelineAria}>{p.steps.map((step, index) => <Reveal key={step.title}><article className={styles.step}><div className={styles.stepNumber} aria-hidden="true"><span>0{index + 1}</span></div><div className={styles.stepTitle}><p>{step.caption}</p><h2>{step.title}</h2></div><div className={styles.stepContent}><p>{step.description}</p><ul className={styles.stepItems}>{step.items.map((item) => <li key={item}><Check size={14} aria-hidden="true" />{item}</li>)}</ul><div className={styles.output}><strong>{p.outputLabel}</strong><br />{step.output}</div></div></article></Reveal>)}</section>
    <section className={styles.conversation}><div className={`container ${styles.conversationInner}`}><div><p className="eyebrow">{p.conversationEyebrow}</p><h2>{p.conversationTitle1}<br />{p.conversationTitle2}</h2></div><div><p>{p.conversationText}</p><ul className={styles.prepareList}>{p.prepare.map((item) => <li key={item}>{item}</li>)}</ul><ButtonLink href="/contato">{p.start}</ButtonLink></div></div></section>
    <FinalCta m={m.finalCta} href={contactHref} newTabLabel={m.a11y.newTab} />
  </>;
}
