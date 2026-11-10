import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import type { PortfolioProject } from "@/types/portfolio";
import styles from "./portfolio.module.css";

export function ProjectCover({ project, large = false }: { project: PortfolioProject; large?: boolean }) {
  if (project.cover) {
    return <div className={`${styles.cover} ${large ? styles.coverLarge : ""}`}><Image src={project.cover.src} alt={project.cover.alt} fill sizes={large ? "(max-width: 1200px) 100vw, 1200px" : "(max-width: 700px) 100vw, 50vw"} className={styles.image} /></div>;
  }

  return (
    <div className={`${styles.cover} ${styles[project.accent]} ${large ? styles.coverLarge : ""}`}>
      <div className={styles.coverGrid} aria-hidden="true" />
      <div className={styles.coverCoordinates} aria-hidden="true"><span>NEXYA / SELECTED WORK</span><span>+ &nbsp; + &nbsp; +</span></div>
      <div className={styles.coverTitle} aria-hidden="true">{project.title === "NEXYA Auto" ? <><span className={styles.autoSmall}>NEXYA</span><span className={styles.autoWord}>AUTO</span></> : project.title === "Aveia / Veia Criativa" ? <><span>Aveia / Veia</span><span className={styles.creativeWord}>Criativa</span></> : project.title}</div>
      <div className={styles.coverPlaceholder}><ImageIcon size={13} aria-hidden="true" /><span>Placeholder · imagem real em preparação</span></div>
      <span className={styles.cornerMark} aria-hidden="true">+</span>
    </div>
  );
}

export function ProjectCard({ project }: { project: PortfolioProject }) {
  return (
    <Link href={`/portfolio/${project.slug}`} className={styles.card}>
      <ProjectCover project={project} />
      <div className={styles.cardInfo}>
        <div><p className={styles.category}>{project.category}</p><h3>{project.title}</h3></div>
        <span className={styles.cardArrow}><ArrowUpRight size={23} aria-hidden="true" /></span>
      </div>
    </Link>
  );
}
