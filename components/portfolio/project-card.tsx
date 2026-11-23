import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PortfolioProject } from "@/types/portfolio";
import styles from "./portfolio.module.css";

/** Card compacto da Home; a apresentação completa fica em /projetos. */
export function ProjectCard({ project }: { project: PortfolioProject }) {
  return (
    <Link href={`/projetos/${project.slug}`} className={styles.card}>
      <div className={styles.cover}><Image src={project.cover.src} alt={project.cover.alt} fill sizes="(max-width: 700px) 100vw, 50vw" className={styles.image} /></div>
      <div className={styles.cardInfo}>
        <div><p className={styles.category}>{project.category}</p><h3>{project.title}</h3></div>
        <span className={styles.cardArrow}><ArrowUpRight size={23} aria-hidden="true" /></span>
      </div>
    </Link>
  );
}
