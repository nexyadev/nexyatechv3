import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/ui";
import { CaseIndex } from "@/components/projects/case-index";
import { CaseLaptop } from "@/components/projects/case-laptop";
import { StaggerTags } from "@/components/projects/case-media";
import { ClipReveal, ProgressLine } from "@/components/projects/case-motion";
import { ProjectsMarquee, StackMarquee } from "@/components/projects/stack-marquee";
import { Link } from "@/i18n/navigation";
import { getMessages } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/routing";
import { allStack } from "@/lib/portfolio/projects";
import { getProjects } from "@/lib/portfolio/repository";
import { whatsappHref } from "@/lib/config";
import { pageContext, type LocaleParams } from "@/lib/page";
import { pageMetadata } from "@/lib/metadata";
import styles from "@/components/projects/projects.module.css";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getMessages(locale).projects.meta;
  return pageMetadata(locale, t.title, t.description, { pathname: "/projetos" });
}

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export default async function ProjectsPage({ params }: LocaleParams) {
  const { locale, m } = await pageContext(params);
  const p = m.projects;
  const projects = await getProjects(locale);
  const next = whatsappHref(m.whatsapp.nextCase);
  const total = String(projects.length).padStart(2, "0");
  return <>
    <PageIntro eyebrow={p.eyebrow} title={p.title} description={p.description} />
    <div className={styles.projectsBand}><ProjectsMarquee projects={projects} label={p.band} prototypeLabel={p.prototype} /></div>
    <CaseIndex projects={projects} label={p.index} />
    <div id="cases" className={styles.cases}>
      <ProgressLine targetId="cases" />
      {projects.map((project, i) => <ClipReveal key={project.slug}>
        <section id={project.slug} className={`container ${styles.case}`} aria-labelledby={`case-${project.slug}`}>
          <div className={styles.caseInfo}>
            <p className={styles.caseNumber}>{String(i + 1).padStart(2, "0")} / {total}</p>
            <h2 id={`case-${project.slug}`} className={styles.caseName}>{project.title}</h2>
            <p className={styles.caseType}>{project.category}{project.prototype && <span className={styles.prototype}>{p.prototype}</span>}</p>
            <StaggerTags items={project.stack} label={p.stack} />
            {project.textApproved && <dl className={styles.story}>
              <div><dt>{p.challenge}</dt><dd>{project.challenge}</dd></div>
              <div><dt>{p.built}</dt><dd>{project.built}</dd></div>
            </dl>}
            <div className={styles.caseActions}>
              <Link href={{ pathname: "/projetos/[slug]", params: { slug: project.slug } }} className="button button-primary">{p.viewCase} <ArrowUpRight size={17} aria-hidden="true" /></Link>
              {project.externalUrl && <a href={project.externalUrl} className="button button-secondary" data-cursor="open" {...external}>{p.viewSite} <ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> {m.a11y.newTab}</span></a>}
            </div>
          </div>
          <CaseLaptop project={project} linked cursorLabel={m.cursor.viewCase} eager={i === 0} />
        </section>
      </ClipReveal>)}
    </div>
    <div className={styles.casesTail}>
      <section className={styles.stackBand} aria-labelledby="stack-geral">
        <p id="stack-geral" className={`container eyebrow ${styles.stackEyebrow}`}>{p.stack}</p>
        <StackMarquee stack={allStack} label={p.stackAll} />
      </section>
      <ClipReveal>
        <section className={`container ${styles.nextCase}`} aria-labelledby="next-case">
          <p className={styles.caseNumber}>{String(projects.length + 1).padStart(2, "0")}</p>
          <h2 id="next-case">{p.nextTitle}</h2>
          <a href={next} className="button button-primary" {...(next.startsWith("https") ? external : {})}>{p.nextButton} <ArrowUpRight size={17} aria-hidden="true" /></a>
        </section>
      </ClipReveal>
    </div>
  </>;
}
