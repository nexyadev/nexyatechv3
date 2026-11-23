"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotionPref } from "@/lib/motion";
import styles from "./projects.module.css";

/**
 * Indicador de progresso da lista de cases: trilho curto e discreto, fixo na margem esquerda enquanto a lista
 * está na tela (só transform). Some em telas sem margem lateral. Movimento reduzido: indicador estático.
 */
export function ProgressLine({ targetId }: { targetId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPref();
  useEffect(() => {
    const el = ref.current, target = document.getElementById(targetId);
    if (!el || !target || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelector("[data-fill]"), { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: target, start: "top 60%", end: "bottom 60%", scrub: .3 } });
    });
    return () => ctx.revert();
  }, [targetId, reduced]);
  return <div ref={ref} className={styles.progress} aria-hidden="true"><span className={styles.progressTrack}><span className={styles.progressFill} data-fill /></span></div>;
}

/** Revela o bloco com máscara (clip-path) + fade + leve subida. Sem JS: visível. Reduzido: fade curto. */
export function ClipReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPref();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (reduced) gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: .3, clearProps: "opacity", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
      else gsap.fromTo(el, { clipPath: "inset(14% 0% 0% 0% round 28px)", opacity: 0, y: 48 }, {
        clipPath: "inset(0% 0% 0% 0% round 28px)", opacity: 1, y: 0, duration: 1.1, ease: "power3.out",
        clearProps: "clipPath,opacity,transform", scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    });
    return () => ctx.revert();
  }, [reduced]);
  return <div ref={ref} className={className}>{children}</div>;
}
