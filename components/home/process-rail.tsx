"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/lib/motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Step = { title: string; text: string };

/**
 * Trilho de luz: uma linha fina (horizontal no desktop, vertical no celular) se preenche com a rolagem e cada
 * passo acende quando a linha chega nele. Sem JS ou com reduced-motion: todos acesos, linha cheia.
 */
export function ProcessRail({ steps }: { steps: readonly Step[] }) {
  const reduced = useReducedMotionPref();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = [...root.querySelectorAll<HTMLElement>("li")];
    const fill = root.querySelector<HTMLElement>("[data-fill]")!;
    if (reduced) { items.forEach((li) => (li.dataset.lit = "true")); root.dataset.ready = "true"; return; }
    gsap.registerPlugin(ScrollTrigger);
    root.dataset.ready = "true";
    const light = (p: number) => items.forEach((li, i) => { li.dataset.lit = String(p >= i / items.length + .01); });
    light(0);
    const st = ScrollTrigger.create({
      trigger: root, start: "top 78%", end: "bottom 45%", scrub: .4,
      onUpdate: (self) => { fill.style.setProperty("--p", self.progress.toFixed(4)); light(self.progress); },
    });
    return () => st.kill();
  }, [reduced]);

  return <div ref={ref} className="process-rail">
    <div className="rail-track" aria-hidden="true"><span data-fill /></div>
    <ol className="home-process-list">
      {steps.map((step, i) => <li key={step.title} data-lit="true">
        <span className="rail-dot" aria-hidden="true" />
        <span className="process-number">0{i + 1}</span>
        <h3>{step.title}</h3>
        <p>{step.text}</p>
      </li>)}
    </ol>
  </div>;
}
