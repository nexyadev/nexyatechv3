"use client";

import Image from "next/image";
import { useReducedMotionPref } from "@/lib/motion";
import { useEffect, useRef } from "react";

/**
 * Notebook + celular grafite com o print real do NEXYA Auto. Inclinação com inércia (lerp .08):
 * mouse no desktop, rolagem + oscilação lenta no toque. reduced-motion: pose fixa (CSS).
 */
export function HeroDevices({ alt, caption }: { alt: string; caption: string }) {
  const reduced = useReducedMotionPref();
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduced) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const target = { x: 0, y: 0 }, cur = { x: 0, y: 0, s: 0 };
    const t0 = performance.now();
    let raf = 0, visible = true;
    const onPointer = (e: PointerEvent) => { target.x = e.clientX / innerWidth - .5; target.y = e.clientY / innerHeight - .5; };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
    });
    function tick(now: number) {
      if (!visible || document.hidden) return;
      if (!fine) { const t = (now - t0) / 1000; target.x = Math.sin(t * .35) * .35; target.y = Math.sin(t * .27) * .2; }
      const progress = Math.min(scrollY / innerHeight, 1);
      cur.x += (target.x - cur.x) * .08; cur.y += (target.y - cur.y) * .08; cur.s += (progress - cur.s) * .1;
      stage!.style.setProperty("--ry", `${(-10 + cur.x * 12).toFixed(2)}deg`);
      stage!.style.setProperty("--rx", `${(6 - cur.y * 8 + cur.s * 8).toFixed(2)}deg`);
      stage!.style.setProperty("--ty", `${(cur.s * -40).toFixed(1)}px`);
      raf = requestAnimationFrame(tick);
    }
    if (fine) addEventListener("pointermove", onPointer, { passive: true });
    io.observe(stage);
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("pointermove", onPointer); ["--rx", "--ry", "--ty"].forEach((v) => stage.style.removeProperty(v)); };
  }, [reduced]);

  return <figure className="devices hero-enter hero-enter-3">
    <div className="devices-stage" ref={stageRef}>
      <div className="laptop">
        <div className="laptop-lid"><div className="laptop-screen">
          <Image src="/images/demo/nexya-auto-painel.webp" alt={alt} width={1600} height={1000} preload sizes="(max-width: 999px) 88vw, 46vw" />
        </div></div>
        <div className="laptop-base" aria-hidden="true" />
      </div>
      <div className="phone" aria-hidden="true">
        <div className="phone-body"><div className="phone-screen">
          <Image src="/images/demo/nexya-auto-celular-painel.webp" alt="" width={600} height={1298} sizes="(max-width: 999px) 22vw, 12vw" loading="lazy" />
        </div></div>
      </div>
    </div>
    <figcaption className="devices-caption">{caption}</figcaption>
  </figure>;
}
