import type { Metadata } from "next";
import { PageIntro, FinalCta } from "@/components/ui";
import { ProjectCard } from "@/components/portfolio/project-card";
import { Reveal } from "@/components/animations/reveal";
import { getProjects } from "@/lib/portfolio/repository";
import { pageMetadata } from "@/lib/metadata";
import styles from "./portfolio-page.module.css";

export const metadata: Metadata = pageMetadata("Portfólio", "Conheça os projetos da NEXYA Tech e o NEXYA Auto, nosso produto para gestão de oficinas.", "/portfolio");

export default async function PortfolioPage() {
  const projects = await getProjects();
  return <>
    <PageIntro eyebrow="Portfólio / Projetos selecionados" title="Ideias que ganham forma." description="Produtos próprios e projetos que fazem parte do universo NEXYA. Tecnologia pensada para sair do papel e fazer parte do dia a dia." />
    <section className={`container ${styles.section}`} aria-label="Projetos NEXYA">
      <div className={styles.heading}><span className="eyebrow">Seleção de projetos</span><span className={styles.note}>Construção, conexão, evolução.</span></div>
      <div className={styles.grid}>{projects.map((project, index) => <Reveal key={project.slug} delay={(index % 2) * 0.08}><ProjectCard project={project} /></Reveal>)}</div>
      <p className={styles.editorialNote}>Transparência faz parte do projeto. As áreas identificadas como placeholder serão substituídas por imagens reais; os cases em preparação ainda não apresentam escopo ou resultados.</p>
    </section>
    <FinalCta />
  </>;
}
