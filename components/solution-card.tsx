"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useRef, type PointerEvent } from "react";

export function SolutionCard({ index, slug, title, description, kind }: { index: string; slug: string; title: string; description: string; kind: "systems" | "automation" | "web" | "connections" }) {
  const ref = useRef<HTMLAnchorElement>(null);
  function onMove(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    ref.current?.style.setProperty("--tilt-x", `${-y * 4}deg`);
    ref.current?.style.setProperty("--tilt-y", `${x * 4}deg`);
  }
  function onLeave() {
    ref.current?.style.setProperty("--tilt-x", "0deg");
    ref.current?.style.setProperty("--tilt-y", "0deg");
  }
  return <Link ref={ref} href={`/solucoes/${slug}`} className="solution-card" onPointerMove={onMove} onPointerLeave={onLeave}>
    <div className="solution-card-top"><span>{index}</span><ArrowUpRight size={20} strokeWidth={1.2} aria-hidden="true" /></div>
    <div className={`solution-art solution-art-${kind}`} aria-hidden="true">
      {kind === "systems" && <><i /><i /><i /><b /></>}
      {kind === "automation" && <><i /><i /><i /><b /><b /></>}
      {kind === "web" && <><i><b /><b /><b /></i><i /></>}
      {kind === "connections" && <><i /><i /><i /><b /><b /><b /><b /></>}
    </div>
    <h3>{title}</h3><p>{description}</p><span className="solution-card-cta">Explorar solução <span>↗</span></span>
  </Link>;
}
