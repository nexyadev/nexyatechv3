import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageIntro, FinalCta, ButtonLink } from "@/components/ui";
import { Reveal } from "@/components/animations/reveal";
import { solutions } from "@/lib/solutions";
import { pageMetadata } from "@/lib/metadata";
import styles from "./solutions.module.css";

export const metadata: Metadata = pageMetadata("Soluções", "Sistemas sob medida, automações, sites, inteligência artificial e integrações. Conheça as soluções da NEXYA Tech para sua empresa.", "/solucoes");

export default function SolutionsPage() {
  return <>
    <PageIntro eyebrow="Soluções / Da ideia à operação" title="Seu desafio. Nossa próxima construção." description="Tecnologia começa com uma boa pergunta: o que precisa funcionar melhor? A resposta orienta cada solução que desenvolvemos." />
    <section className={`container ${styles.solutionList}`} aria-label="Soluções da NEXYA">
      {solutions.map((solution, index) => <Reveal key={solution.slug} delay={index * 0.04}><Link href={`/solucoes/${solution.slug}`} className={styles.solutionRow}><span className={styles.number}>{solution.number}</span><h2>{solution.title}</h2><p>{solution.description}</p><span className={styles.rowArrow}><ArrowUpRight size={21} aria-hidden="true" /></span></Link></Reveal>)}
    </section>
    <section className={styles.crossSection}><div className={`container ${styles.crossInner}`}><div><p className="eyebrow">Além de uma categoria</p><h2>O problema vem antes da tecnologia.</h2></div><div><p>Seu projeto pode precisar de um sistema, de uma integração ou de uma combinação de soluções. Começamos pelo contexto para definir um caminho técnico que faça sentido.</p><p>Também atuamos com inteligência artificial, correção de bugs e soluções personalizadas, sempre a partir de uma avaliação do cenário.</p><ButtonLink href="/contato" variant="text">Conte seu desafio</ButtonLink><div className={styles.crossTags}><span>Inteligência artificial</span><span>Correção de bugs</span><span>Evolução de sistemas</span></div></div></div></section>
    <FinalCta />
  </>;
}
