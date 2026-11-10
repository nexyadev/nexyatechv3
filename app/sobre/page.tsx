import type { Metadata } from "next";
import Image from "next/image";
import { PageIntro, ButtonLink, FinalCta } from "@/components/ui";
import { Reveal } from "@/components/animations/reveal";
import { pageMetadata } from "@/lib/metadata";
import styles from "./about.module.css";

export const metadata: Metadata = pageMetadata("Sobre a NEXYA", "Conheça a NEXYA Tech: desenvolvimento de sistemas, automações, sites e soluções técnicas para empresas.", "/sobre");

const principles = [
  { title: "Entender antes de construir", text: "Começar pelo negócio, por quem usa a solução e pelo problema que precisa ser resolvido. A tecnologia vem para dar forma a esse entendimento." },
  { title: "Clareza em cada etapa", text: "Transformar necessidades em um escopo compreensível, com prioridades e critérios de entrega que possam ser conversados." },
  { title: "Design e engenharia juntos", text: "Cuidar da experiência e da estrutura técnica como partes da mesma solução. O que as pessoas veem e o que faz tudo funcionar." },
  { title: "Construir com continuidade", text: "Pensar além da primeira entrega. Documentar decisões e preparar uma base que permita avaliar os próximos passos com contexto." },
];

export default function AboutPage() {
  return <>
    <PageIntro eyebrow="Sobre / NEXYA Tech" title="Ideias merecem uma boa engenharia." description="Somos a NEXYA Tech. Criamos sistemas, automações e experiências digitais para aproximar o que uma empresa imagina daquilo que ela pode colocar em prática." />
    <section className={`container ${styles.opening}`}><Reveal><div className={styles.identity}><span className={styles.identityLabel}>NEXYA TECH / IDENTIDADE</span><Image src="/images/logo-nexya.png" alt="Logo oficial NEXYA" width={2172} height={724} sizes="(max-width: 640px) 80vw, 40vw" /><div className={styles.identityFooter}><span>Tecnologia em movimento</span><span>+ &nbsp; +</span></div></div></Reveal><div className={styles.introCopy}><h2>Uma visão ampla.<br />Uma solução específica.</h2><p>Cada empresa tem seus próprios desafios. Alguns pedem um sistema sob medida. Outros, um site bem construído, uma automação ou uma integração que faça as peças conversarem.</p><p>Nosso trabalho é transformar essas necessidades em soluções digitais, conectando estratégia, design e desenvolvimento.</p><p>Também atuamos na evolução do que já existe: investigando bugs, ajustando fluxos e construindo caminhos técnicos para novos objetivos.</p><ButtonLink href="/solucoes" variant="text">Explore nossas soluções</ButtonLink></div></section>
    <section className={styles.principles}><div className="container"><div className={styles.principlesHead}><p className="eyebrow">O que orienta o trabalho</p><h2>A qualidade começa nas decisões.</h2></div><div className={styles.principleGrid}>{principles.map((principle,index) => <Reveal key={principle.title} delay={(index % 2) * .07}><div className={styles.principle}><span>0{index+1}</span><h3>{principle.title}</h3><p>{principle.text}</p></div></Reveal>)}</div></div></section>
    <section className={`container ${styles.product}`}><div><p className="eyebrow">Nosso ecossistema</p><h2>Também construímos nossos próprios produtos.</h2></div><div><p>O NEXYA Auto é a plataforma de gestão de oficinas da NEXYA. Um produto que reúne clientes, veículos, ordens de serviço, checklists, fotos de entrada e orçamentos.</p><p>Uma aplicação concreta da nossa proposta: colocar a tecnologia a serviço de uma operação real.</p><ButtonLink href="/nexya-auto" variant="secondary">Conhecer NEXYA Auto</ButtonLink></div></section>
    <FinalCta />
  </>;
}
