"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/lib/motion";
import type { CaseVideo as CaseVideoData } from "@/types/portfolio";
import styles from "./projects.module.css";

/** No máximo 2 vídeos tocando ao mesmo tempo na página; os demais ficam no poster. */
const playing = new Set<HTMLVideoElement>();
const MAX_PLAYING = 2;

/**
 * Vídeo curto de rolagem: mudo, loop, preload none. Só carrega e toca quando entra em vista e há vaga;
 * sai de vista → pausa e libera a vaga. reduced-motion: fica no poster.
 */
export function CaseVideo({ video, className = "" }: { video: CaseVideoData; className?: string }) {
  const reduced = useReducedMotionPref();
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const stop = () => { el.pause(); playing.delete(el); };
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= .5) {
        if (playing.has(el) || playing.size >= MAX_PLAYING) return;
        playing.add(el);
        el.play().catch(() => playing.delete(el));
      } else stop();
    }, { threshold: [0, .5] });
    io.observe(el);
    return () => { io.disconnect(); stop(); };
  }, [reduced]);

  return <video ref={ref} className={className} width={video.width} height={video.height} poster={video.poster} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1}>
    <source src={video.webm} type="video/webm" />
    <source src={video.mp4} type="video/mp4" />
  </video>;
}

/** Etiquetas de stack que entram em sequência (40ms) quando a linha chega na tela. */
export function StaggerTags({ items, label }: { items: readonly string[]; label: string }) {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.ready = "true";
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.dataset.inview = "true"; io.disconnect(); } }, { rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  if (!items.length) return null;
  return <ul ref={ref} className={styles.stack} aria-label={label}>{items.map((item, i) => <li key={item} style={{ ["--i" as string]: i }}>{item}</li>)}</ul>;
}
