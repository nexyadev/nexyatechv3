"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/lib/motion";

/**
 * Topo de /solucoes: módulos de linha fina que se encaixam e se conectam. Três camadas em profundidades
 * diferentes reagem ao mouse (só transform). reduced-motion ou toque: composição estática, já montada.
 */
export function ModulesVisual() {
  const reduced = useReducedMotionPref();
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    svg.dataset.ready = "true";
    if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const layers = [...svg.querySelectorAll<SVGGElement>("[data-depth]")];
    const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    let raf = 0;
    const tick = () => {
      cur.x += (target.x - cur.x) * .06; cur.y += (target.y - cur.y) * .06;
      layers.forEach((g) => { const d = Number(g.dataset.depth); g.style.transform = `translate(${(cur.x * d).toFixed(2)}px, ${(cur.y * d).toFixed(2)}px)`; });
      if (Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > .02) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => { target.x = (e.clientX / innerWidth - .5) * 2; target.y = (e.clientY / innerHeight - .5) * 2; cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", onMove); layers.forEach((g) => { g.style.transform = ""; }); };
  }, [reduced]);

  return <svg ref={ref} className="modules-visual" viewBox="0 0 520 420" fill="none" aria-hidden="true" focusable="false">
    <g data-depth="6" className="mv-layer">
      <path pathLength={1} className="mv-draw mv-faint" d="M40 210 H480 M260 30 V390" />
      <circle pathLength={1} className="mv-draw mv-faint" cx="260" cy="210" r="168" />
    </g>
    <g data-depth="14" className="mv-layer">
      <path pathLength={1} className="mv-draw mv-link" d="M178 150 C220 150 220 118 262 118 M342 150 C380 150 380 250 342 250 M178 270 C140 270 140 330 186 330" />
      <rect pathLength={1} className="mv-draw mv-mod" style={{ ["--i" as string]: 0 }} x="98" y="118" width="80" height="64" rx="10" />
      <rect pathLength={1} className="mv-draw mv-mod" style={{ ["--i" as string]: 1 }} x="262" y="86" width="80" height="64" rx="10" />
      <rect pathLength={1} className="mv-draw mv-mod" style={{ ["--i" as string]: 2 }} x="262" y="218" width="80" height="64" rx="10" />
      <rect pathLength={1} className="mv-draw mv-mod" style={{ ["--i" as string]: 3 }} x="98" y="238" width="80" height="64" rx="10" />
      <rect pathLength={1} className="mv-draw mv-mod" style={{ ["--i" as string]: 4 }} x="186" y="300" width="80" height="64" rx="10" />
    </g>
    <g data-depth="26" className="mv-layer">
      <circle className="mv-node" cx="178" cy="150" r="4" /><circle className="mv-node" cx="262" cy="118" r="4" />
      <circle className="mv-node" cx="342" cy="150" r="4" /><circle className="mv-node" cx="342" cy="250" r="4" />
      <circle className="mv-node" cx="178" cy="270" r="4" /><circle className="mv-node" cx="186" cy="330" r="4" />
      <path pathLength={1} className="mv-draw" d="M112 134 H150 M112 146 H138 M276 102 H318 M276 114 H302 M276 234 H326 M276 246 H296" />
    </g>
  </svg>;
}
