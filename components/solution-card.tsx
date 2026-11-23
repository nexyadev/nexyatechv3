"use client";

import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, type PointerEvent } from "react";
import { SolutionArt, type SolutionKind } from "@/components/solutions/solution-art";
import { isReducedMotion } from "@/lib/motion";

/**
 * Card inteiro é um único link (uma seta só). Borda de luz que segue o mouse, inclinação sutil e leve elevação
 * só com mouse; a ilustração se desenha ao entrar na tela (IntersectionObserver) e anima no hover/foco.
 */
export function SolutionCard({ index, slug, title, description, kind, featured = false }: { index: string; slug: string; title: string; description: string; kind: SolutionKind; featured?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { el.dataset.inview = "true"; io.disconnect(); } }, { rootMargin: "0px 0px -12% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function onMove(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse" || isReducedMotion()) return;
    const el = event.currentTarget, r = el.getBoundingClientRect();
    const x = (event.clientX - r.left) / r.width, y = (event.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    el.style.setProperty("--tilt-x", `${(-(y - .5) * 4).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${((x - .5) * 4).toFixed(2)}deg`);
  }
  function onLeave() {
    ref.current?.style.setProperty("--tilt-x", "0deg");
    ref.current?.style.setProperty("--tilt-y", "0deg");
  }

  return <Link ref={ref} href={{ pathname: "/solucoes/[slug]", params: { slug } }} className={`solution-card ${featured ? "solution-card-featured" : ""}`} onPointerMove={onMove} onPointerLeave={onLeave}>
    <div className="solution-card-top"><span>{index}</span><span className="solution-card-arrow"><ArrowUpRight size={18} strokeWidth={1.4} aria-hidden="true" /></span></div>
    <SolutionArt kind={kind} />
    <div className="solution-card-copy"><h3>{title}</h3><p>{description}</p></div>
  </Link>;
}
