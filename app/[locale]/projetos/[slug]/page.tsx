import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Play } from "lucide-react";
import { CaseLaptop } from "@/components/projects/case-laptop";
import { CaseVideo } from "@/components/projects/case-media";
import { ClipReveal } from "@/components/projects/case-motion";
import { StackMarquee } from "@/components/projects/stack-marquee";
import { Reveal } from "@/components/animations/reveal";
import { Link } from "@/i18n/navigation";
import { fmt, getMessages } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/routing";
import { caseSlugs } from "@/lib/portfolio/projects";
import { getProject, getProjects } from "@/lib/portfolio/repository";
import { siteConfig, whatsappHref } from "@/lib/config";
import { pageContext } from "@/lib/page";
import { pageMetadata } from "@/lib/metadata";
import styles from "@/components/projects/projects.module.css";

type Props = { params: Promise<{ locale: string; slug: string }> };
const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export function generateStaticParams() {
  return locales.flatMap((locale) => caseSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const project = await getProject(locale, slug);
  if (!project) return { title: getMessages(locale).projects.notFound };
  return pageMetadata(locale, project.title, project.description, { pathname: "/projetos/[slug]", params: { slug } });
}

export default async function CasePage({ params }: Props) {
  const { locale, m } = await pageContext(params);
  const p = m.projects;
  const project = await getProject(locale, (await params).slug);
  if (!project) notFound();
  const projects = await getProjects(locale);
  const next = projects[(projects.findIndex((item) => item.slug === project.slug) + 1) % projects.length];
  const cta = whatsappHref(project.cta.message);
  const ctaProps = cta.startsWith("https") ? external : {};
  const isAuto = project.slug === "nexya-auto";

  return <>
    <header className={`container ${styles.caseHero}`}>
      <div className={styles.caseInfo}>
        <Link href="/projetos" className={styles.back}><ArrowLeft size={16} aria-hidden="true" />{p.back}</Link>
        <p className="eyebrow"><span className="eyebrow-line" />{project.category}</p>
        <h1 className={styles.caseName}>{project.title}</h1>
        {project.prototype && <p className={styles.caseType}><span className={styles.prototype}>{p.prototype}</span></p>}
        <p className={styles.caseLead}>{project.description}</p>
        <div className={styles.heroActions}>
          <a href={cta} className="button button-primary" {...ctaProps}>{project.cta.label} <ArrowUpRight size={17} aria-hidden="true" /></a>
          {project.externalUrl && <a href={project.externalUrl} className="button button-secondary" data-cursor="open" {...external}>{p.viewSite} <ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> {m.a11y.newTab}</span></a>}
          {isAuto && siteConfig.trialUrl && <a href={siteConfig.trialUrl} className="button button-secondary" {...external}>{p.trial} <ArrowUpRight size={17} aria-hidden="true" /></a>}
        </div>
      </div>
      <CaseLaptop project={project} eager hero />
    </header>
    <p className={`container ${styles.imageNote}`}>{project.imageNote}</p>

    {project.textApproved && <section className={`container ${styles.storyBlock}`} aria-label={p.storyAria}>
      <Reveal><div><p className="eyebrow">{p.challenge}</p><p className={styles.storyText}>{project.challenge}</p></div></Reveal>
      <Reveal delay={.08}><div><p className="eyebrow">{p.built}</p><p className={styles.storyText}>{project.built}</p></div></Reveal>
    </section>}

    {/* Blocos 2, 4 e 9 marcados [CONFIRMAR EM PRODUÇÃO] em lib/nexya-auto-features.ts. */}
    {isAuto && <section className={`container ${styles.features}`} aria-labelledby="features-title">
      <h2 id="features-title" className={styles.sectionTitle}>{p.featuresTitle}</h2>
      <ol>{m.nexyaAuto.features.map((feature, i) => <li key={feature.title}><Reveal delay={(i % 3) * .05}><span className={styles.featureNumber}>{String(i + 1).padStart(2, "0")}</span><h3>{feature.title}</h3><p>{feature.text}</p></Reveal></li>)}</ol>
    </section>}

    <section className={`container ${styles.gallery}`} aria-labelledby="gallery-title">
      <h2 id="gallery-title" className={styles.sectionTitle}>{p.gallery}</h2>
      <div className={styles.galleryGrid}>{project.gallery.map((shot) => <ClipReveal key={shot.src} className={shot.height > shot.width ? styles.galleryTall : styles.galleryWide}>
        <figure><div className={styles.galleryFrame}><Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes={shot.height > shot.width ? "(max-width: 899px) 60vw, 22vw" : "(max-width: 899px) 92vw, 60vw"} /></div><figcaption>{shot.caption}</figcaption></figure>
      </ClipReveal>)}</div>
    </section>

    {project.stack.length > 0 && <section className={styles.stackBand} aria-labelledby="stack-title">
      <h2 id="stack-title" className={`container ${styles.sectionTitle}`}>{p.stackTitle}</h2>
      <StackMarquee stack={project.stack} label={fmt(p.stackOf, { nome: project.title })} />
    </section>}

    {isAuto ? <section className={`container ${styles.video}`} aria-labelledby="video-title">
      <h2 id="video-title" className={styles.sectionTitle}>{p.videoAutoTitle}</h2>
      <figure className={styles.videoFrame}>
        <Image src="/images/demo/nexya-auto-painel.webp" alt={p.videoPosterAlt} width={1600} height={1000} sizes="(max-width: 1199px) 92vw, 1100px" />
        <button type="button" className={styles.play} disabled aria-describedby="video-soon"><Play size={22} aria-hidden="true" /><span className="sr-only">{p.play}</span></button>
        <figcaption id="video-soon">{p.videoSoon}</figcaption>
      </figure>
    </section> : project.video && <section className={`container ${styles.video}`} aria-labelledby="video-title">
      <h2 id="video-title" className={styles.sectionTitle}>{p.videoTitle}</h2>
      <figure className={`${styles.videoFrame} ${styles.videoLive}`} data-cursor="play" data-cursor-label={m.cursor.play}><CaseVideo video={project.video} /></figure>
    </section>}

    <section className={`container ${styles.nextCase}`} aria-labelledby="case-cta">
      <h2 id="case-cta">{isAuto ? p.autoCtaTitle : p.nextTitle}</h2>
      <a href={cta} className="button button-primary" {...ctaProps}>{project.cta.label} <ArrowUpRight size={17} aria-hidden="true" /></a>
    </section>

    {next && next.slug !== project.slug && <nav className={`container ${styles.caseNext}`} aria-label={p.nextProject}>
      <p className="eyebrow">{p.nextProject}</p>
      <Link href={{ pathname: "/projetos/[slug]", params: { slug: next.slug } }} className={styles.nextLink}><span>{next.title}</span><ArrowUpRight size={34} strokeWidth={1.2} aria-hidden="true" /></Link>
    </nav>}
  </>;
}
