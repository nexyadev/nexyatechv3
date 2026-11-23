"use client";

import Image from "next/image";
import { useReducedMotionPref } from "@/lib/motion";
import { Link } from "@/i18n/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { PortfolioProject } from "@/types/portfolio";
import { CaseVideo } from "./case-media";
import styles from "./projects.module.css";

/**
 * Notebook grafite em CSS 3D. A tela "rola" a imagem alta do projeto conforme a rolagem (scrub, reversível);
 * duas telas satélite em profundidades diferentes (parallax). Inclinação: mouse no desktop, rolagem no toque.
 * Com `href`, o mockup vira link (fora da ordem de tabulação: o botão "Ver case" é o acesso por teclado)
 * e o cursor vira a pill "Ver case". reduced-motion: tudo parado, na primeira tela.
 */
export function CaseLaptop({ project, linked = false, eager = false, hero = false, cursorLabel }: { project: PortfolioProject; linked?: boolean; eager?: boolean; hero?: boolean; cursorLabel?: string }) {
  const reduced = useReducedMotionPref();
  const rootRef = useRef<HTMLDivElement>(null);

  const travel = Math.max(0, (1 - (project.scroll.width * 10 / 16) / project.scroll.height) * 100);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const stage = root.querySelector<HTMLElement>("[data-stage]")!;
    const shot = root.querySelector<HTMLElement>("[data-shot]")!;
    const sats = root.querySelectorAll<HTMLElement>("[data-depth]");

    const ctx = gsap.context(() => {
      const scroll = { trigger: root, start: "top bottom", end: "bottom top", scrub: .6 };
      // A tela (16:10) mostra uma janela da captura alta; a captura percorre o que sobra.
      gsap.fromTo(shot, { yPercent: 0 }, { yPercent: -travel, ease: "none", scrollTrigger: hero ? { trigger: root, start: "top top", end: "bottom top", scrub: .6 } : { trigger: root, start: "top 75%", end: "bottom 25%", scrub: .6 } });
      sats.forEach((el) => { const d = Number(el.dataset.depth); gsap.fromTo(el, { y: 70 * d }, { y: -70 * d, ease: "none", scrollTrigger: scroll }); });
      if (!fine) gsap.fromTo(stage, { rotateX: 9, rotateY: -8 }, { rotateX: -3, rotateY: 4, ease: "none", scrollTrigger: scroll });
    }, root);

    if (!fine) return () => ctx.revert();

    const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    let raf = 0, hovering = false;
    const tick = () => {
      cur.x += (target.x - cur.x) * .08; cur.y += (target.y - cur.y) * .08;
      stage.style.transform = `rotateX(${(4 - cur.y * 6).toFixed(2)}deg) rotateY(${(-6 + cur.x * 10).toFixed(2)}deg)`;
      if (Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > .001 || hovering) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width - .5; target.y = (e.clientY - r.top) / r.height - .5;
      cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    };
    const onEnter = () => { hovering = true; root.dataset.hover = "true"; };
    const onLeave = () => { hovering = false; root.dataset.hover = "false"; target.x = 0; target.y = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    return () => { ctx.revert(); cancelAnimationFrame(raf); stage.style.transform = ""; root.removeEventListener("pointermove", onMove); root.removeEventListener("pointerenter", onEnter); root.removeEventListener("pointerleave", onLeave); };
  }, [hero, travel, reduced]);

  const [phone, crop] = project.satellites;
  const body = <>
    <div className={styles.stage} data-stage>
      <div className={styles.lid}><div className={styles.screen}>
        <div className={styles.shot} data-shot>
          <Image src={project.scroll.src} alt={project.scroll.alt} width={project.scroll.width} height={project.scroll.height} sizes="(max-width: 899px) 90vw, 56vw" {...(hero ? { preload: true } : { loading: eager ? "eager" as const : "lazy" as const })} />
        </div>
      </div></div>
      <div className={styles.base} aria-hidden="true" />
    </div>
    <div className={`${styles.sat} ${styles.satPhone}`} data-depth="1" aria-hidden="true">
      <div className={styles.phoneBody}><Image src={phone.src} alt="" width={phone.width} height={phone.height} sizes="(max-width: 899px) 26vw, 12vw" /></div>
    </div>
    <div className={`${styles.sat} ${styles.satCrop}`} data-depth="1.8" aria-hidden="true">
      {project.video ? <CaseVideo video={project.video} /> : <Image src={crop.src} alt="" width={crop.width} height={crop.height} sizes="(max-width: 899px) 44vw, 22vw" />}
    </div>
  </>;

  // O cursor inteligente (SmartCursor) vira a pílula "Ver case" sobre o mockup.
  return <div ref={rootRef} className={styles.mockup} data-hover="false" {...(linked && cursorLabel ? { "data-cursor": "view", "data-cursor-label": cursorLabel } : {})}>
    {linked ? <Link href={{ pathname: "/projetos/[slug]", params: { slug: project.slug } }} className={styles.mockupLink} tabIndex={-1} aria-hidden="true">{body}</Link> : body}
  </div>;
}
