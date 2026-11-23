"use client";

import Image from "next/image";
import { useReducedMotionPref } from "@/lib/motion";
import { useEffect, useRef, useState } from "react";
import type { PortfolioProject } from "@/types/portfolio";
import styles from "./projects.module.css";

/**
 * Índice editorial dos cases. Desktop (pointer fine): a prévia do projeto flutua e segue o cursor com inércia.
 * Celular: lista simples com miniatura. Os links levam à seção do case nesta página.
 */
export function CaseIndex({ projects, label }: { projects: readonly PortfolioProject[]; label: string }) {
  const reduced = useReducedMotionPref();
  const previewRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    let raf = 0;
    const tick = () => {
      const k = reduced ? 1 : .14;
      cur.x += (target.x - cur.x) * k; cur.y += (target.y - cur.y) * k;
      preview.style.transform = `translate3d(${cur.x.toFixed(1)}px, ${cur.y.toFixed(1)}px, 0)`;
      if (Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > .5) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => { target.x = e.clientX + 28; target.y = e.clientY - 110; cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", onMove); };
  }, [reduced]);

  return <nav className={`container ${styles.index}`} aria-label={label}>
    <ol>
      {projects.map((project, i) => <li key={project.slug}>
        <a href={`#${project.slug}`} onPointerEnter={() => setActive(project.slug)} onPointerLeave={() => setActive(null)}>
          <span className={styles.indexNumber}>0{i + 1}</span>
          <span className={styles.indexThumb} aria-hidden="true"><Image src={project.cover.src} alt="" width={160} height={100} sizes="80px" /></span>
          <span className={styles.indexName}>{project.title}</span>
          <span className={styles.indexType}>{project.category}</span>
        </a>
      </li>)}
    </ol>
    <div ref={previewRef} className={styles.preview} data-visible={active !== null} aria-hidden="true">
      {projects.map((project) => <Image key={project.slug} src={project.cover.src} alt="" width={480} height={300} sizes="320px" data-active={active === project.slug} />)}
    </div>
  </nav>;
}
