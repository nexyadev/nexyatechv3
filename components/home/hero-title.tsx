"use client";

import { Fragment, useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/lib/motion";

const BASE = 300, MAX = 500, RADIUS = 150;

/**
 * Módulo D: o peso da Outfit variável (300 → 500) aumenta nas letras perto do cursor, com inércia.
 * Acessibilidade: o H1 expõe uma única string (aria-label com o texto completo); o texto aparece uma só vez no DOM.
 * Sem layout shift: antes de animar, cada letra recebe a largura medida no peso base (inline-block fixo),
 * então engrossar não muda a quebra de linha. Só desktop com pointer fine e sem reduced-motion.
 */
export function HeroTitle({ id, text }: { id: string; text: string }) {
  const reduced = useReducedMotionPref();
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const h1 = ref.current;
    if (!h1) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches || reduced || innerWidth < 1000) return;
    let disposed = false, raf = 0, active = false;
    const letters = [...h1.querySelectorAll<HTMLSpanElement>("[data-l]")];
    const weight = letters.map(() => BASE), target = letters.map(() => BASE);
    let centers: { x: number; y: number }[] = [];
    const measure = () => { centers = letters.map((l) => { const r = l.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); };
    const lock = () => { letters.forEach((l) => { l.style.width = ""; }); letters.forEach((l) => { l.style.width = `${l.getBoundingClientRect().width}px`; }); measure(); };
    const tick = () => {
      let moving = false;
      letters.forEach((l, i) => {
        weight[i] += (target[i] - weight[i]) * .12;
        if (Math.abs(target[i] - weight[i]) > .5) moving = true;
        l.style.fontVariationSettings = `"wght" ${weight[i].toFixed(0)}`;
      });
      raf = moving || active ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      const box = h1.getBoundingClientRect();
      active = e.clientY > box.top - RADIUS && e.clientY < box.bottom + RADIUS && e.clientX > box.left - RADIUS && e.clientX < box.right + RADIUS;
      centers.forEach((c, i) => { const d = Math.hypot(e.clientX - c.x, e.clientY - c.y); target[i] = active ? BASE + (MAX - BASE) * Math.max(0, 1 - d / RADIUS) ** 2 : BASE; });
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onScroll = () => { if (!disposed) measure(); };
    const onResize = () => { if (!disposed) lock(); };
    document.fonts.ready.then(() => { if (disposed) return; lock(); h1.dataset.reactive = "true"; addEventListener("pointermove", onMove, { passive: true }); });
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    return () => { disposed = true; cancelAnimationFrame(raf); letters.forEach((l) => { l.style.fontVariationSettings = ""; l.style.width = ""; }); removeEventListener("pointermove", onMove); removeEventListener("scroll", onScroll); removeEventListener("resize", onResize); };
  }, [text, reduced]);

  const words = text.split(" ");
  return <h1 id={id} ref={ref} className="hero-title" aria-label={text}>
    <span>{words.map((word, wi) => <Fragment key={wi}><span className="hero-word">{[...word].map((ch, ci) => <span key={ci} data-l className="hero-letter">{ch}</span>)}</span>{wi < words.length - 1 ? " " : ""}</Fragment>)}</span>
  </h1>;
}
