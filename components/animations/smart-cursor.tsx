"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/lib/motion";
import { useI18n } from "@/components/i18n/i18n-provider";

type Kind = "view" | "open" | "drag" | "play";

/**
 * Módulo C: um ponto que segue o mouse (com inércia) e vira pílula com texto conforme o alvo:
 * [data-cursor="view|open|drag|play"] (texto opcional em data-cursor-label) e links externos ("Abrir").
 * Não substitui o cursor do sistema (só some sobre campos de texto), não recebe foco e não interfere no teclado.
 * Só pointer fine; não aparece no celular nem com reduced-motion. Só transform/opacity animam.
 */
export function SmartCursor() {
  const reduced = useReducedMotionPref();
  const { m } = useI18n();
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const labels = useRef(m.cursor);
  useEffect(() => { labels.current = m.cursor; }, [m.cursor]);

  useEffect(() => {
    const dot = dotRef.current, label = labelRef.current;
    if (!dot || !label) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches || reduced) return;
    const target = { x: -100, y: -100 }, cur = { x: -100, y: -100 };
    let raf = 0, state = "";
    const tick = () => {
      cur.x += (target.x - cur.x) * .22; cur.y += (target.y - cur.y) * .22;
      dot.style.transform = `translate3d(${cur.x.toFixed(1)}px, ${cur.y.toFixed(1)}px, 0)`;
      raf = Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > .3 ? requestAnimationFrame(tick) : 0;
    };
    const setState = (next: string, text = "") => {
      if (next === state && label.textContent === text) return;
      state = next; dot.dataset.state = next; label.textContent = text;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX; target.y = e.clientY;
      dot.dataset.visible = "true";
      const el = e.target as Element | null;
      if (el?.closest("input, textarea, select, [contenteditable='true']")) setState("hidden");
      else {
        const tagged = el?.closest<HTMLElement>("[data-cursor]");
        if (tagged) { const kind = tagged.dataset.cursor as Kind; setState("pill", tagged.dataset.cursorLabel || labels.current[kind] || ""); }
        else if (el?.closest("a[target='_blank']")) setState("pill", labels.current.open);
        else if (el?.closest("a, button, summary, [role='option'], [role='menuitemradio']")) setState("link");
        else setState("dot");
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => { dot.dataset.visible = "false"; };
    const onDown = () => dot.setAttribute("data-press", "true");
    const onUp = () => dot.removeAttribute("data-press");
    addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    addEventListener("pointerdown", onDown, { passive: true });
    addEventListener("pointerup", onUp, { passive: true });
    return () => { dot.dataset.visible = "false"; cancelAnimationFrame(raf); removeEventListener("pointermove", onMove); document.documentElement.removeEventListener("pointerleave", onLeave); removeEventListener("pointerdown", onDown); removeEventListener("pointerup", onUp); };
  }, [reduced]);

  return <div ref={dotRef} className="smart-cursor" data-state="dot" data-visible="false" aria-hidden="true"><span className="smart-cursor-shape"><span ref={labelRef} className="smart-cursor-label" /></span></div>;
}
