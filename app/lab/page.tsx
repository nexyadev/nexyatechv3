import type { Metadata } from "next";
import { Fragment, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Blocks, Check, CircleDashed, MonitorSmartphone, Workflow } from "lucide-react";
import "@fontsource-variable/sora";
import { MagneticLink } from "@/components/animations/magnetic-link";
import { LabHeader } from "@/components/lab/lab-header";
import { LabLoader, LOADER_BOOT } from "@/components/lab/lab-loader";
import { GlassCard, Reveal } from "@/components/lab/lab-motion";
import { SilkBackground } from "@/components/lab/silk-background";
import { contactUrl, siteConfig } from "@/lib/config";
import { LOGO_IMAGE } from "@/lib/brand/logo-geometry";
import { getProjects } from "@/lib/portfolio/repository";
import styles from "@/components/lab/lab.module.css";

/** Prototype route: never indexed, not in the sitemap, not in the menu. */
export const metadata: Metadata = {
  title: { absolute: "Lab — NEXYA Tech" },
  description: "Protótipo de direção visual da NEXYA Tech. Não indexado.",
  robots: { index: false, follow: false },
  icons: { icon: "/images/lab/nexya-icon-64.png" },
};

const SOLUTIONS = [
  { slug: "sistemas", title: "Sistemas sob medida", text: "Sua operação, suas regras. Software pensado para a realidade do seu negócio.", image: "/images/nexya-auto-dashboard.webp", alt: "Captura real do painel NEXYA Auto, um sistema construído pela NEXYA" },
  { slug: "automacoes", title: "Automações inteligentes", text: "Menos tarefas repetitivas. Mais espaço para o trabalho que faz a diferença.", image: null, alt: "" },
  { slug: "sites", title: "Sites de alto impacto", text: "Experiências que traduzem sua marca e aproximam as pessoas do seu negócio.", image: null, alt: "" },
  { slug: "integracoes", title: "Integrações e evolução", text: "Conectamos ferramentas, corrigimos problemas e evoluímos o que já existe.", image: null, alt: "" },
] as const;

/** Real capture published on the official NEXYA Auto site (1168 × 750). */
const PRODUCT_SHOT = { width: 1168, height: 750 } as const;

const DIFFERENTIALS = [
  { icon: Blocks, label: "Sistemas" },
  { icon: Workflow, label: "Automações" },
  { icon: MonitorSmartphone, label: "Experiências digitais" },
  { icon: CircleDashed, label: "[PREENCHER: 4º diferencial]" },
] as const;

const PROCESS = [
  { title: "Descoberta", text: "Ouvimos, perguntamos e entendemos o que realmente precisa mudar." },
  { title: "Estratégia", text: "Transformamos o desafio em um plano claro, com escopo e direção." },
  { title: "Desenvolvimento", text: "Design e engenharia juntos, com validação em cada etapa." },
  { title: "Evolução", text: "Acompanhamos os próximos passos e planejamos o que vem depois." },
] as const;

/** Each word is masked so the title can be revealed word by word after the loader. */
function Words({ text, from = 0, metal = false }: { text: string; from?: number; metal?: boolean }) {
  return <>{text.split(" ").map((word, i) => (
    <Fragment key={`${word}-${i}`}><span className={styles.word}><span className={metal ? styles.metal : undefined} style={{ "--i": from + i } as CSSProperties}>{word}</span></span>{" "}</Fragment>
  ))}</>;
}

export default async function LabPage() {
  const projects = await getProjects();
  const external = contactUrl.startsWith("https");

  return (
    // The loader boot script marks this element before the first paint, hence suppressHydrationWarning.
    <div id="lab-root" className={styles.lab} suppressHydrationWarning>
      <LabLoader />
      <script dangerouslySetInnerHTML={{ __html: LOADER_BOOT }} />
      <noscript><style>{`#lab-loader{display:none!important}`}</style></noscript>
      <SilkBackground />
      <LabHeader />

      <section id="inicio" className={styles.hero} data-silk-scene="hero" aria-labelledby="lab-title">
        <p className={styles.label}>Tecnologia em movimento</p>
        <h1 id="lab-title" className={styles.heroTitle}>
          <Words text="Tecnologia que" /><br />
          <Words text="transforma" from={2} /> <Words text="ideias" from={3} metal /><br />
          <Words text="em" from={4} /> <Words text="soluções." from={5} metal />
        </h1>
        <p className={styles.heroLead}>Criamos sistemas, automações e experiências digitais para empresas que querem crescer com tecnologia de verdade.</p>
        <div className={styles.heroActions}>
          <MagneticLink href={contactUrl} className={styles.btnPrimary} target={external ? "_blank" : undefined} rel="noopener noreferrer">Falar com a NEXYA <ArrowRight size={18} aria-hidden="true" /></MagneticLink>
          <MagneticLink href="#solucoes" className={styles.btnGhost}>Explorar soluções <ArrowRight size={18} aria-hidden="true" /></MagneticLink>
        </div>
        <ul className={styles.differentials}>
          {DIFFERENTIALS.map(({ icon: Icon, label }) => <li key={label}><Icon size={22} strokeWidth={1.2} aria-hidden="true" /><span>{label}</span></li>)}
        </ul>
        <a href="#manifesto" className={styles.scrollCue}><span className={styles.mouse} aria-hidden="true"><span /></span>Role para explorar</a>
      </section>

      <section id="manifesto" className={styles.manifesto} data-silk-scene="manifesto" aria-labelledby="lab-manifesto">
        <Reveal><p className={styles.label}>01 / Nossa essência</p></Reveal>
        <Reveal delay={80}><h2 id="lab-manifesto" className={styles.manifestoTitle}>Não entregamos apenas sites. <span className={styles.dim}>Construímos soluções que movem empresas.</span></h2></Reveal>
        <Reveal delay={160} className={styles.manifestoFoot}>
          <span className={styles.drawLine} aria-hidden="true" />
          <p>Tecnologia faz sentido quando resolve algo real. Conectamos visão de negócio, design e engenharia para tirar o próximo passo do papel.</p>
          <Link href="/sobre" className={styles.round} aria-label="Conhecer a NEXYA"><ArrowUpRight size={20} aria-hidden="true" /></Link>
        </Reveal>
      </section>

      <section id="solucoes" className={styles.solutions} data-silk-scene="solutions" aria-labelledby="lab-solutions">
        <Reveal as="header" className={styles.sectionHead}>
          <div><p className={styles.label}>02 / O que construímos</p><h2 id="lab-solutions" className={styles.sectionTitle}>Seu desafio. <span className={styles.metal}>Nossa próxima solução.</span></h2></div>
          <p className={styles.sectionLead}>Do que precisa ser criado ao que pode funcionar melhor.</p>
        </Reveal>
        <div className={styles.cardGrid}>
          {SOLUTIONS.map((solution, index) => (
            <Reveal key={solution.slug} delay={index * 90}>
              <GlassCard>
                <Link href={`/solucoes/${solution.slug}`} className={styles.cardLink}>
                  <span className={styles.cardMedia}>
                    {solution.image
                      ? <Image src={solution.image} alt={solution.alt} fill sizes="(max-width: 700px) 92vw, 25vw" className={styles.cardImage} />
                      : <span className={styles.placeholder}>[PREENCHER: imagem real]</span>}
                  </span>
                  <span className={styles.cardIndex}>0{index + 1}</span>
                  <span className={styles.cardTitle}>{solution.title}</span>
                  <span className={styles.cardText}>{solution.text}</span>
                  <span className={styles.cardCta}>Explorar solução <ArrowRight size={16} aria-hidden="true" /></span>
                </Link>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="produto" className={styles.product} data-silk-scene="product" aria-labelledby="lab-product">
        <Reveal className={styles.productCopy}>
          <p className={styles.label}>03 / Produto NEXYA</p>
          <p className={styles.wordmark}>NEXYA <span>Auto</span></p>
          <h2 id="lab-product" className={styles.sectionTitle}>Sua oficina. <span className={styles.metal}>Uma nova direção.</span></h2>
          <p className={styles.sectionLead}>Gestão de oficinas, da entrada do veículo à entrega. Um produto real que traduz a nossa forma de construir tecnologia.</p>
          <ul className={styles.checks}>{["Clientes e veículos organizados", "Ordens de serviço e orçamentos", "Checklists e fotos de entrada"].map((item) => <li key={item}><Check size={14} aria-hidden="true" />{item}</li>)}</ul>
          <Link href="/nexya-auto" className={styles.btnGhost}>Conhecer NEXYA Auto <ArrowRight size={18} aria-hidden="true" /></Link>
        </Reveal>
        <Reveal delay={120} className={styles.productShot}>
          <Image src="/images/nexya-auto-service-order.webp" alt="Captura real da ordem de serviço do NEXYA Auto, divulgada no site oficial com nomes e valores ocultados" width={PRODUCT_SHOT.width} height={PRODUCT_SHOT.height} sizes="(max-width: 900px) 92vw, 50vw" className={styles.productImage} />
        </Reveal>
      </section>

      <section id="portfolio" className={styles.portfolio} data-silk-scene="portfolio" aria-labelledby="lab-portfolio">
        <Reveal as="header" className={styles.sectionHead}>
          <div><p className={styles.label}>04 / Projetos &amp; possibilidades</p><h2 id="lab-portfolio" className={styles.sectionTitle}>Ideias que <span className={styles.metal}>ganham forma.</span></h2></div>
          <Link href="/portfolio" className={styles.textLink}>Explorar portfólio <ArrowRight size={16} aria-hidden="true" /></Link>
        </Reveal>
        <div className={styles.projectGrid}>
          {projects.map((project, index) => (
            <Reveal key={project.slug} delay={index * 80}>
              <Link href={`/portfolio/${project.slug}`} className={styles.project}>
                <span className={styles.projectCover}>
                  {project.cover
                    ? <Image src={project.cover.src} alt={project.cover.alt} fill sizes="(max-width: 700px) 92vw, 45vw" className={styles.cardImage} />
                    : <span className={styles.placeholder}>[PREENCHER: imagem do case]</span>}
                </span>
                <span className={styles.projectMeta}>{project.category}</span>
                <span className={styles.projectTitle}>{project.title}<ArrowUpRight size={20} aria-hidden="true" /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="processo" className={styles.process} data-silk-scene="calm" aria-labelledby="lab-process">
        <Reveal as="header" className={styles.sectionHead}>
          <div><p className={styles.label}>05 / Nosso processo</p><h2 id="lab-process" className={styles.sectionTitle}>Clareza em cada etapa.</h2></div>
          <p className={styles.sectionLead}>Boas soluções começam com as perguntas certas. Você acompanha o caminho, do primeiro encontro à evolução.</p>
        </Reveal>
        <ol className={styles.steps}>
          {PROCESS.map((step, index) => (
            <Reveal as="li" key={step.title} delay={index * 90}>
              <span className={styles.stepNumber}>0{index + 1}<span className={styles.drawLine} aria-hidden="true" /></span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section id="contato" className={styles.final} data-silk-scene="calm" aria-labelledby="lab-final">
        <Reveal>
          <p className={styles.label}>Próximo capítulo</p>
          <h2 id="lab-final" className={styles.finalTitle}>Sua próxima solução começa com uma <span className={styles.metal}>conversa.</span></h2>
          <MagneticLink href="/contato" className={styles.btnPrimary}>Vamos construir juntos <ArrowRight size={18} aria-hidden="true" /></MagneticLink>
        </Reveal>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <span className={styles.brandMark}><Image src={LOGO_IMAGE.src} alt="NEXYA Tech" width={LOGO_IMAGE.width} height={LOGO_IMAGE.height} sizes="170px" /></span>
          <p>Ideias conectadas. Possibilidades em movimento.</p>
        </div>
        <nav className={styles.footerLinks} aria-label="Rodapé">
          <Link href="/sobre">Sobre a NEXYA</Link><Link href="/portfolio">Portfólio</Link><Link href="/processo">Nosso processo</Link><Link href="/contato">Fale com a gente</Link><Link href="/privacidade">Privacidade</Link>
          {siteConfig.socials.map((social) => <a key={social.url} href={social.url} target="_blank" rel="noopener noreferrer">{social.label.replace("Instagram · ", "")}</a>)}
        </nav>
        <p className={styles.copyright}>© {new Date().getFullYear()} NEXYA Tech. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
