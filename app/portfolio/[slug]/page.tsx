import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { ProjectCover } from "@/components/portfolio/project-card";
import { getProject, getProjects } from "@/lib/portfolio/repository";
import { pageMetadata } from "@/lib/metadata";
import styles from "../portfolio-page.module.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProjects()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return { title: "Projeto não encontrado" };
  return {
    ...pageMetadata(project.title, project.description, `/portfolio/${project.slug}`),
    ...(project.status === "pending" ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ProjectPage({ params }: Props) {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  const projects = await getProjects();
  const next = projects[(projects.findIndex((item) => item.slug === project.slug) + 1) % projects.length];

  return <div className="container">
    <header className={styles.caseHero}>
      <Link href="/portfolio" className={styles.back}><ArrowLeft size={16} aria-hidden="true" />Voltar ao portfólio</Link>
      <p className="eyebrow">{project.category}</p>
      <h1>{project.title}</h1>
      <p className={styles.caseLead}>{project.description}</p>
    </header>
    <ProjectCover project={project} large />
    {project.cover && <p className={styles.imageCaption}>Captura real divulgada no <a href="https://nexyaauto.com/" target="_blank" rel="noopener noreferrer">site oficial do NEXYA Auto</a>. Nomes e valores ocultados na imagem de origem.</p>}
    <section className={styles.caseContent}>
      <div><p className="eyebrow">Sobre o projeto</p><h2>{project.status === "documented" ? "Tecnologia que faz parte da operação." : "Uma história em preparação."}</h2></div>
      <div>
        {project.status === "documented" ? <>
          <p>O NEXYA Auto é um produto da NEXYA Tech para gestão de oficinas. A plataforma reúne registros e etapas que fazem parte da rotina, da entrada do veículo à organização dos serviços.</p>
          <ul className={styles.detailList}>{project.details.map((detail) => <li key={detail}><Check size={17} aria-hidden="true" /><span>{detail}</span></li>)}</ul>
          <ButtonLink href="/nexya-auto">Conhecer NEXYA Auto</ButtonLink>
        </> : <div className={styles.pending}><h3>Case em preparação</h3><p>As imagens, o contexto e o escopo deste projeto serão apresentados quando o material estiver revisado. {project.namePending ? "O nome de exibição também está em confirmação. " : ""}Por enquanto, este espaço identifica o projeto sem antecipar informações ou resultados.</p></div>}
      </div>
    </section>
    {next && <nav className={styles.caseNext} aria-label="Próximo projeto"><div><p className="eyebrow">Continue explorando</p><Link href={`/portfolio/${next.slug}`} className={styles.nextLink}><h2>{next.title}</h2><ArrowUpRight size={30} aria-hidden="true" /></Link></div><ButtonLink href="/contato" variant="secondary">Vamos conversar</ButtonLink></nav>}
  </div>;
}
