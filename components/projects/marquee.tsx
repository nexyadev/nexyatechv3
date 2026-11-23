"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { useI18n } from "@/components/i18n/i18n-provider";
import { useReducedMotionPref } from "@/lib/motion";
import { BANDS_EVENT, BANDS_KEY } from "@/lib/motion-script";
import styles from "./marquee.module.css";

/* Estado "faixas pausadas" em <html data-bands="paused"> (aplicado no <head> antes do paint). */
const bandsPaused = () => document.documentElement.dataset.bands === "paused";
function subscribeBands(onChange: () => void) {
  addEventListener(BANDS_EVENT, onChange);
  return () => removeEventListener(BANDS_EVENT, onChange);
}
function setBandsPaused(paused: boolean) {
  if (paused) document.documentElement.dataset.bands = "paused"; else delete document.documentElement.dataset.bands;
  try { localStorage.setItem(BANDS_KEY, paused ? "paused" : "running"); } catch { /* storage bloqueado: vale só nesta visita */ }
  dispatchEvent(new Event(BANDS_EVENT));
}

/**
 * Faixa contínua, SEMPRE passando de lado.
 * - Base em CSS puro (já no HTML do servidor): trilho width:max-content, uma linha (nowrap), sequência + 1 clone,
 *   @keyframes translate3d de 0 a -50%. Não depende de JS para começar.
 * - Movimento reduzido: a mesma animação ~2,5x mais lenta (CSS), sem ligação com a rolagem.
 * - JS (aprimoramento): velocidade ligada à rolagem e direção que inverte ao subir, com inércia (playbackRate).
 * - Hover/foco pausam. Botão Pausar/Retomar (aria-pressed); pausado = UMA linha rolável com snap, sem clones.
 */
export function Marquee({ items, label, rows = 1, repeat: initialRepeat = 1, duration = 55 }: {
  items: { key: string; node: ReactNode }[]; label: string; rows?: 1 | 2; repeat?: number; duration?: number;
}) {
  const { m } = useI18n();
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPref();
  const paused = useSyncExternalStore(subscribeBands, bandsPaused, () => false);
  const [repeat, setRepeat] = useState(initialRepeat);

  // Repete a sequência dentro da cópia quando ela é mais estreita que a faixa (evita buraco no laço).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const check = () => {
      if (bandsPaused()) return;
      const seqs = [...root.querySelectorAll<HTMLElement>("[data-seq]")];
      const narrow = Math.min(...seqs.map((s) => s.offsetWidth || Infinity));
      if (!isFinite(narrow)) return;
      const need = Math.ceil((root.clientWidth + 1) / narrow);
      setRepeat((r) => Math.max(r, need));
    };
    check();
    addEventListener("resize", check);
    return () => removeEventListener("resize", check);
  }, [paused]);

  // Aprimoramento: rolagem acelera e inverte a direção (com inércia). Só no modo completo e sem pausa.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced || paused) return;
    const anims = () => [...root.querySelectorAll<HTMLElement>("[data-track]")].flatMap((t) => t.getAnimations?.() ?? []);
    let dir = 1, boost = 0, rate = 1, lastY = scrollY, raf = 0, visible = false;
    const onScroll = () => {
      const dy = scrollY - lastY; lastY = scrollY;
      if (dy !== 0) dir = dy > 0 ? 1 : -1;
      boost = Math.min(boost + Math.abs(dy) * .04, 5);
    };
    const frame = () => {
      boost *= .93;
      const target = dir * (1 + boost);
      const next = rate + (target - rate) * .06;      // inércia: passa por zero suavemente ao inverter
      if (Math.abs(next - rate) > .0005) { rate = next; for (const a of anims()) a.playbackRate = rate; }
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const start = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else cancelAnimationFrame(raf); });
    const onVis = () => { if (!document.hidden && visible) start(); };
    io.observe(root);
    addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      removeEventListener("scroll", onScroll); document.removeEventListener("visibilitychange", onVis);
      for (const a of anims()) a.playbackRate = 1;
    };
  }, [reduced, paused, repeat]);

  const perRow = Math.ceil(items.length / rows);
  const groups = Array.from({ length: rows }, (_, i) => items.slice(i * perRow, (i + 1) * perRow)).filter((g) => g.length);
  const sequence = (group: typeof items, clone: boolean) => Array.from({ length: repeat }, (_, r) => {
    const dup = clone || r > 0;
    return <div key={r} className={styles.seq} {...(dup ? { "data-clone": "", "aria-hidden": true, inert: true } : { "data-seq": "" })}>
      {group.map((item) => <Fragment key={item.key}>{item.node}</Fragment>)}
    </div>;
  });

  return <div ref={rootRef} className={styles.marquee} role="region" aria-label={label} data-marquee style={{ "--dur": `${duration}s` } as CSSProperties}>
    <div className={styles.viewport} data-viewport>
      {groups.map((group, i) => <div key={i} className={styles.row}>
        <div className={styles.track} data-track>
          <div className={styles.copy}>{sequence(group, false)}</div>
          <div className={styles.copy} data-clone="" aria-hidden="true" inert>{sequence(group, true)}</div>
        </div>
      </div>)}
    </div>
    <button type="button" className={styles.pauseBtn} aria-pressed={paused} aria-label={paused ? m.bands.resume : m.bands.pause}
      title={paused ? m.bands.resume : m.bands.pause} onClick={() => setBandsPaused(!paused)} data-bands-toggle>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        {paused ? <path d="M8 5.5v13l10.5-6.5z" /> : <path d="M9 5.5v13M15 5.5v13" />}
      </svg>
    </button>
  </div>;
}
