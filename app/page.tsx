import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, MoveUpRight } from "lucide-react";
import { HeroSculpture } from "@/components/3d/hero-sculpture";
import { Reveal } from "@/components/animations/reveal";
import { TextReveal } from "@/components/animations/text-reveal";
import { MagneticLink } from "@/components/animations/magnetic-link";
import { ButtonLink, FinalCta, SectionHeading } from "@/components/ui";
import { SolutionCard } from "@/components/solution-card";
import { ProjectCard } from "@/components/portfolio/project-card";
import { ProductDiagram } from "@/components/product/product-diagram";
import { getProjects } from "@/lib/portfolio/repository";
import { contactUrl } from "@/lib/config";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Tecnologia que transforma ideias em soluções", "Criamos sistemas, automações e experiências digitais para empresas que querem crescer com tecnologia de verdade. Conheça a NEXYA Tech.", "/");

const process = [
  { title: "Descoberta", text: "Ouvimos, perguntamos e entendemos o que realmente precisa mudar." },
  { title: "Estratégia", text: "Transformamos o desafio em um plano claro, com escopo e direção." },
  { title: "Desenvolvimento", text: "Design e engenharia juntos, com validação em cada etapa." },
  { title: "Evolução", text: "Acompanhamos os próximos passos e planejamos o que vem depois." },
];

export default async function Home() {
  const projects = await getProjects();
  return <>
    <section className="hero container" aria-labelledby="hero-title">
      <div className="hero-topline"><p className="eyebrow"><span className="status-dot" />TECNOLOGIA EM MOVIMENTO</p><span className="hero-edition">ESTRATÉGIA. CÓDIGO. POSSIBILIDADES.</span></div>
      <div className="hero-copy">
        <h1 id="hero-title">Tecnologia que<br />transforma <span className="hero-ideas">ideias</span><br />em <span className="hero-solution">soluções.</span></h1>
        <p className="hero-description">Criamos sistemas, automações e experiências digitais para empresas que querem crescer com tecnologia de verdade.</p>
        <div className="hero-actions"><MagneticLink href={contactUrl} className="button button-primary" target={contactUrl.startsWith("https") ? "_blank" : undefined} rel="noopener noreferrer">Falar com a NEXYA <ArrowUpRight size={18} aria-hidden="true" /></MagneticLink><ButtonLink href="#solucoes" variant="secondary">Explorar soluções</ButtonLink></div>
        <div className="hero-note"><span className="hero-note-line" /><span>Da primeira ideia.<br /><strong>À próxima transformação.</strong></span></div>
      </div>
      <div className="hero-art"><div className="hero-grid" aria-hidden="true" /><HeroSculpture /><span className="art-coordinate coord-top">N / X — CONEXÃO</span><span className="art-coordinate coord-bottom">ESTRUTURA PARA O PRÓXIMO PASSO</span><span className="art-plus" aria-hidden="true">+</span></div>
      <div className="hero-bottom"><a href="#manifesto" className="scroll-cue"><span className="scroll-cue-icon"><ArrowDown size={15} /></span>EXPLORE O QUE É POSSÍVEL</a><div className="hero-capabilities"><span>SISTEMAS</span><i /> <span>AUTOMAÇÕES</span><i /><span>EXPERIÊNCIAS DIGITAIS</span></div><span className="hero-counter">01 — 07</span></div>
    </section>

    <section id="manifesto" className="manifesto container section" aria-labelledby="manifesto-title">
      <div className="manifesto-aside"><p className="eyebrow">01 / NOSSA ESSÊNCIA</p><MoveUpRight size={50} strokeWidth={0.75} aria-hidden="true" /></div>
      <div className="manifesto-main"><h2 id="manifesto-title"><TextReveal text="Não entregamos apenas sites. Construímos soluções que movem empresas." /></h2><div className="manifesto-caption"><span className="tiny-cross" aria-hidden="true">+</span><p>Tecnologia faz sentido quando resolve algo real.<br />Conectamos visão de negócio, design e engenharia para tirar o próximo passo do papel.</p><Link href="/sobre" className="round-link" aria-label="Conhecer a NEXYA"><ArrowUpRight size={22} /></Link></div></div>
    </section>

    <section id="solucoes" className="solutions-section section container" aria-labelledby="solutions-heading">
      <Reveal><div className="section-heading"><div><p className="eyebrow">02 / O QUE CONSTRUÍMOS</p><h2 id="solutions-heading">Seu desafio.<br /><span className="muted">Nossa próxima solução.</span></h2></div><p>Do que precisa ser criado<br />ao que pode funcionar melhor.</p></div></Reveal>
      <Reveal><div className="solutions-grid">
        <SolutionCard index="01" slug="sistemas" kind="systems" title="Sistemas sob medida" description="Sua operação, suas regras. Software pensado para a realidade do seu negócio." />
        <SolutionCard index="02" slug="automacoes" kind="automation" title="Automações inteligentes" description="Menos tarefas repetitivas. Mais espaço para o trabalho que faz a diferença." />
        <SolutionCard index="03" slug="sites" kind="web" title="Sites de alto impacto" description="Experiências que traduzem sua marca e aproximam as pessoas do seu negócio." />
        <SolutionCard index="04" slug="integracoes" kind="connections" title="Integrações e evolução" description="Conectamos ferramentas, corrigimos problemas e evoluímos o que já existe." />
      </div></Reveal>
      <div className="solutions-bottom"><span>SOFTWARE COM PROPÓSITO. DO INÍCIO À EVOLUÇÃO.</span><ButtonLink href="/solucoes" variant="text">Todas as soluções</ButtonLink></div>
    </section>

    <section className="product-section section" aria-labelledby="product-heading"><div className="container">
      <div className="product-topline"><p className="eyebrow">03 / PRODUTO NEXYA</p><span className="product-badge"><span />CONSTRUÍDO PELA NEXYA TECH</span></div>
      <div className="home-product-grid"><div className="home-product-copy"><p className="product-wordmark">NEXYA <span>AUTO</span></p><h2 id="product-heading">Sua oficina.<br />Uma nova<br /><span className="muted">direção.</span></h2><p>Gestão de oficinas, da entrada do veículo à entrega. Um produto real que traduz a nossa forma de construir tecnologia.</p><ul className="product-checks">{["Clientes e veículos organizados", "Ordens de serviço e orçamentos", "Checklists e fotos de entrada"].map((item) => <li key={item}><Check size={14} aria-hidden="true" />{item}</li>)}</ul><ButtonLink href="/nexya-auto">Conhecer NEXYA Auto</ButtonLink></div><div className="home-product-visual"><ProductDiagram compact /></div></div>
      <div className="product-bottomline"><span>UMA SOLUÇÃO DO ECOSSISTEMA NEXYA</span><Link href="/nexya-auto">Tecnologia aplicada ao dia a dia <ArrowUpRight size={16} /></Link></div>
    </div></section>

    <section className="section container home-portfolio" aria-labelledby="portfolio-heading"><Reveal><div className="section-heading"><div><p className="eyebrow">04 / PROJETOS & POSSIBILIDADES</p><h2 id="portfolio-heading">Ideias que<br /><span className="muted">ganham forma.</span></h2></div><ButtonLink href="/portfolio" variant="text">Explorar portfólio</ButtonLink></div></Reveal><div className="home-project-grid">{projects.map((project) => <Reveal key={project.slug}><ProjectCard project={project} /></Reveal>)}</div></section>

    <section className="section container home-process" aria-label="Nosso processo"><Reveal><SectionHeading eyebrow="05 / NOSSO PROCESSO" title="Clareza em cada etapa." description="Boas soluções começam com as perguntas certas. Você acompanha o caminho, do primeiro encontro à evolução." /></Reveal><ol className="home-process-list">{process.map((step, i) => <li key={step.title}><Reveal delay={i * 0.06}><span className="process-number">0{i + 1}<span aria-hidden="true">↗</span></span><h3>{step.title}</h3><p>{step.text}</p></Reveal></li>)}</ol><ButtonLink href="/processo" variant="text">Entenda como trabalhamos</ButtonLink></section>
    <FinalCta />
  </>;
}
