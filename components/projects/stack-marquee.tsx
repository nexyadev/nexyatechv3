import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";
import type { PortfolioProject } from "@/types/portfolio";
import { Marquee } from "./marquee";
import styles from "./marquee.module.css";

/** Ícones de linha fina, monocromáticos e genéricos (não são logos das tecnologias). */
const glyphs: Record<string, ReactNode> = {
  TypeScript: <><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M7 10h6M10 10v7M17.5 11.2c-.4-.8-1.1-1.2-2-1.2-1.1 0-1.8.6-1.8 1.4 0 2 3.9 1.2 3.9 3.4 0 .9-.8 1.7-2 1.7-.9 0-1.7-.4-2.1-1.2" /></>,
  JavaScript: <><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M10.5 10v5.2c0 1.1-.7 1.8-1.7 1.8M17.5 11.2c-.4-.8-1.1-1.2-2-1.2-1.1 0-1.8.6-1.8 1.4 0 2 3.9 1.2 3.9 3.4 0 .9-.8 1.7-2 1.7-.9 0-1.7-.4-2.1-1.2" /></>,
  React: <><ellipse cx="12" cy="12" rx="9" ry="3.6" /><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(-60 12 12)" /><circle cx="12" cy="12" r="1.2" /></>,
  "Next.js": <><circle cx="12" cy="12" r="9" /><path d="M9 16V8l7 9M15 8v5" /></>,
  "Tailwind CSS": <path d="M3 11c1.5-3 3.5-4 6-3 1.5.6 2.5 2 4.5 2 2 0 3.5-1 4.5-3-1.5 3-3.5 4-6 3-1.5-.6-2.5-2-4.5-2M3 17c1.5-3 3.5-4 6-3 1.5.6 2.5 2 4.5 2 2 0 3.5-1 4.5-3-1.5 3-3.5 4-6 3-1.5-.6-2.5-2-4.5-2" />,
  "Node.js": <><path d="M12 2.8 20 7.4v9.2l-8 4.6-8-4.6V7.4z" /><path d="M12 8v8M9 10l3-2 3 2" /></>,
  Prisma: <><path d="M12 3 4 17l7 4 9-4z" /><path d="M12 3l-1 18" /></>,
  PostgreSQL: <><ellipse cx="12" cy="5.5" rx="7" ry="2.5" /><path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" /></>,
  GSAP: <><path d="M3 18c4 0 5-12 9-12s5 12 9 12" /><circle cx="12" cy="6" r="1.4" /></>,
  WebGL: <><path d="M12 3 20 7.5v9L12 21l-8-4.5v-9z" /><path d="M4 7.5 12 12l8-4.5M12 12v9" /></>,
  "Three.js": <><path d="M4 20 12 4l8 16z" /><path d="M8 12h8M12 4v16" /></>,
  Zod: <><path d="M12 3 19 6v6c0 4.2-3 7.4-7 9-4-1.6-7-4.8-7-9V6z" /><path d="m9 12 2 2 4-4" /></>,
  Playwright: <><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><path d="m10 9.5 4.5 2.5-4.5 2.5z" /></>,
  HTML: <path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />,
  CSS: <path d="M9 4C6 4 7 9 4 12c3 3 2 8 5 8M15 4c3 0 2 5 5 8-3 3-2 8-5 8" />,
};

export function StackIcon({ name }: { name: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{glyphs[name] ?? <circle cx="12" cy="12" r="8" />}</svg>;
}

/**
 * Faixa de Stack: 2 linhas em sentidos opostos (quando ha mais de 4 itens), em TODAS as larguras.
 * Cada tecnologia aparece uma vez no conteudo lido; clones do laco ficam aria-hidden/inert no Marquee.
 */
export function StackMarquee({ stack, label }: { stack: readonly string[]; label: string }) {
  if (!stack.length) return null;
  const items = stack.map((name) => ({ key: name, node: <span className={styles.pill}><StackIcon name={name} />{name}</span> }));
  const rows = stack.length > 4 ? 2 : 1;
  const perRow = Math.ceil(stack.length / rows);
  return <Marquee items={items} rows={rows} label={label} repeat={Math.max(1, Math.ceil(16 / perRow))} duration={50} />;
}

/** Faixa lenta com os projetos (nome grande + miniatura + etiqueta) numa única linha. Clique leva ao case. */
export function ProjectsMarquee({ projects, label, prototypeLabel }: { projects: readonly PortfolioProject[]; label: string; prototypeLabel: string }) {
  const items = projects.map((project) => ({ key: project.slug, node: <span className={styles.copyItem}>
    <Link href={{ pathname: "/projetos/[slug]", params: { slug: project.slug } }} className={styles.project} data-cursor="open">
      <span className={styles.thumb}><Image src={project.cover.src} alt="" width={224} height={140} sizes="112px" /></span>
      <span className={styles.projectName}>{project.title}</span>
      {project.prototype && <span className={styles.badge}>{prototypeLabel}</span>}
    </Link>
    <span className={styles.sep} aria-hidden="true">/</span>
  </span> }));
  return <Marquee items={items} label={label} duration={60} />;
}
