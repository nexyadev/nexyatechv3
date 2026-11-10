import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Blocks, Compass, Workflow } from "lucide-react";
import { PageIntro, ButtonLink, FinalCta } from "@/components/ui";
import { Reveal } from "@/components/animations/reveal";
import { solutions, getSolution } from "@/lib/solutions";
import { pageMetadata } from "@/lib/metadata";
import styles from "../solutions.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return solutions.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const solution = getSolution((await params).slug);
  return solution ? pageMetadata(solution.title, solution.summary, `/solucoes/${solution.slug}`) : { title: "Solução não encontrada" };
}

export default async function SolutionPage({ params }: Props) {
  const solution = getSolution((await params).slug);
  if (!solution) notFound();
  const icons = [Compass, Workflow, Blocks];
  return <>
    <div className={styles.detailIntro}><PageIntro eyebrow={`Solução ${solution.number} / ${solution.eyebrow}`} title={solution.title} description={solution.summary}><div className={styles.introActions}><ButtonLink href={`/contato?solucao=${solution.slug}`}>Conversar sobre meu projeto</ButtonLink><ButtonLink href="#possibilidades" variant="text">Explorar possibilidades</ButtonLink></div></PageIntro></div>
    <section id="possibilidades" className={`container ${styles.benefits}`}><Reveal><h2 className={styles.statement}>{solution.statement}</h2></Reveal><div className={styles.benefitGrid}>{solution.benefits.map((benefit, index) => { const Icon = icons[index]; return <Reveal key={benefit.title} delay={index * .07}><div className={styles.benefit}>{Icon && <Icon className={styles.benefitIcon} size={25} strokeWidth={1.3} aria-hidden="true" />}<h3>{benefit.title}</h3><p>{benefit.text}</p></div></Reveal>; })}</div></section>
    <section className={styles.delivery}><div className={`container ${styles.deliveryInner}`}><div><p className="eyebrow">Da conversa à entrega</p><h2>Um caminho claro para construir.</h2><p>Cada proposta define prioridades, entregas e condições do projeto. Estas são as frentes que orientam nosso trabalho.</p><ButtonLink href="/processo" variant="text">Conhecer o processo</ButtonLink></div><ol className={styles.deliveryList}>{solution.deliverables.map((item, index) => <li key={item}><span>0{index + 1}</span>{item}</li>)}</ol></div></section>
    <section className={`container ${styles.faq}`}><div><p className="eyebrow">Perguntas frequentes</p><h2>Antes de dar o próximo passo.</h2></div><div className={styles.faqList}>{solution.questions.map(({ question, answer }) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
    <nav className={`container ${styles.related}`} aria-label="Outras soluções">{solutions.filter((item) => item.slug !== solution.slug).map((item) => <Link href={`/solucoes/${item.slug}`} key={item.slug}>{item.title}<ArrowUpRight size={16} aria-hidden="true" /></Link>)}</nav>
    <FinalCta />
  </>;
}
