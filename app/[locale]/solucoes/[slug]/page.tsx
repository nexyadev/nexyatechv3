import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, Blocks, Compass, Workflow } from "lucide-react";
import { PageIntro, ButtonLink, FinalCta } from "@/components/ui";
import { Reveal } from "@/components/animations/reveal";
import { Link } from "@/i18n/navigation";
import { fmt, getMessages } from "@/i18n/dictionaries";
import { isLocale, locales, solutionKeys, solutionSlug, type SolutionKey } from "@/i18n/routing";
import { getSolution, getSolutions } from "@/lib/solutions";
import { pageContext } from "@/lib/page";
import { pageMetadata } from "@/lib/metadata";
import styles from "../solutions.module.css";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => solutionKeys.map((key) => ({ locale, slug: solutionSlug(locale, key) })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const solution = getSolution(locale, slug);
  if (!solution) return { title: getMessages(locale).solutionsPage.notFound };
  const key: SolutionKey = solution.key;
  return pageMetadata(locale, solution.title, solution.summary, { pathname: "/solucoes/[slug]", params: (l) => ({ slug: solutionSlug(l, key) }) });
}

export default async function SolutionPage({ params }: Props) {
  const { locale, m, contactHref } = await pageContext(params);
  const solution = getSolution(locale, (await params).slug);
  if (!solution) notFound();
  const s = m.solutionsPage;
  const icons = [Compass, Workflow, Blocks];
  return <>
    <div className={styles.detailIntro}><PageIntro eyebrow={fmt(s.detailEyebrow, { numero: solution.number, rotulo: solution.eyebrow })} title={solution.title} description={solution.summary}><div className={styles.introActions}><ButtonLink href={{ pathname: "/contato", query: { solucao: solution.key } }}>{s.talk}</ButtonLink><ButtonLink href="#possibilidades" variant="text">{s.explore}</ButtonLink></div></PageIntro></div>
    <section id="possibilidades" className={`container ${styles.benefits}`}><Reveal><h2 className={styles.statement}>{solution.statement}</h2></Reveal><div className={styles.benefitGrid}>{solution.benefits.map((benefit, index) => { const Icon = icons[index]; return <Reveal key={benefit.title} delay={index * .07}><div className={styles.benefit}>{Icon && <Icon className={styles.benefitIcon} size={25} strokeWidth={1.3} aria-hidden="true" />}<h3>{benefit.title}</h3><p>{benefit.text}</p></div></Reveal>; })}</div></section>
    <section className={styles.delivery}><div className={`container ${styles.deliveryInner}`}><div><p className="eyebrow">{s.deliveryEyebrow}</p><h2>{s.deliveryTitle}</h2><p>{s.deliveryText}</p><ButtonLink href="/processo" variant="text">{s.deliveryLink}</ButtonLink></div><ol className={styles.deliveryList}>{solution.deliverables.map((item, index) => <li key={item}><span>0{index + 1}</span>{item}</li>)}</ol></div></section>
    <section className={`container ${styles.faq}`}><div><p className="eyebrow">{s.faqEyebrow}</p><h2>{s.faqTitle}</h2></div><div className={styles.faqList}>{solution.questions.map(({ question, answer }) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
    <nav className={`container ${styles.related}`} aria-label={s.related}>{getSolutions(locale).filter((item) => item.key !== solution.key).map((item) => <Link href={{ pathname: "/solucoes/[slug]", params: { slug: item.slug } }} key={item.key}>{item.title}<ArrowUpRight size={16} aria-hidden="true" /></Link>)}</nav>
    <FinalCta m={m.finalCta} href={contactHref} newTabLabel={m.a11y.newTab} />
  </>;
}
