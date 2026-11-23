import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PageIntro, FinalCta, ButtonLink } from "@/components/ui";
import { Reveal } from "@/components/animations/reveal";
import { ModulesVisual } from "@/components/solutions/modules-visual";
import { SolutionArt, kindBySlug } from "@/components/solutions/solution-art";
import { Link } from "@/i18n/navigation";
import { getMessages } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/routing";
import { getSolutions } from "@/lib/solutions";
import { pageContext, type LocaleParams } from "@/lib/page";
import { pageMetadata } from "@/lib/metadata";
import styles from "./solutions.module.css";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale).solutionsPage.meta;
  return pageMetadata(locale, t.title, t.description, { pathname: "/solucoes" });
}

export default async function SolutionsPage({ params }: LocaleParams) {
  const { locale, m, contactHref } = await pageContext(params);
  const s = m.solutionsPage;
  return <>
    <PageIntro eyebrow={s.eyebrow} title={s.title} description={s.description} aside={<ModulesVisual />} />
    <section className={`container ${styles.solutionList}`} aria-label={s.listAria}>
      {getSolutions(locale).map((solution, index) => <Reveal key={solution.key} delay={index * 0.04}><Link href={{ pathname: "/solucoes/[slug]", params: { slug: solution.slug } }} className={styles.solutionRow}><span className={styles.number}>{solution.number}</span><h2>{solution.title}</h2><p>{solution.description}</p><SolutionArt kind={kindBySlug[solution.key]} className={styles.rowArt} /><span className={styles.rowArrow}><ArrowUpRight size={21} aria-hidden="true" /></span></Link></Reveal>)}
    </section>
    <section className={styles.crossSection}><div className={`container ${styles.crossInner}`}><div><p className="eyebrow">{s.crossEyebrow}</p><h2>{s.crossTitle}</h2></div><div><p>{s.crossText1}</p><p>{s.crossText2}</p><ButtonLink href="/contato" variant="text">{s.crossLink}</ButtonLink><div className={styles.crossTags}>{s.crossTags.map((tag) => <span key={tag}>{tag}</span>)}</div></div></div></section>
    <FinalCta m={m.finalCta} href={contactHref} newTabLabel={m.a11y.newTab} />
  </>;
}
