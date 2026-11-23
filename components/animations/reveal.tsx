"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotionPref } from "@/lib/motion";

/** Progressive enhancement: tudo fica visível sem JS. Movimento reduzido: só um fade curto, sem deslocamento. */
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const root = useRef<HTMLDivElement>(null);
  const animation = useRef<gsap.core.Tween | null>(null);
  const reduced = useReducedMotionPref();

  useEffect(() => {
    if (!root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const items = root.current!.querySelectorAll<HTMLElement>("[data-reveal-item]");
      const targets = items.length ? Array.from(items) : root.current!;
      animation.current = gsap.fromTo(targets, reduced ? { opacity: 0 } : { opacity: 0, y: 28 }, {
        opacity: 1,
        ...(reduced ? {} : { y: 0 }),
        duration: reduced ? .3 : .85,
        ease: "power3.out",
        stagger: reduced ? 0 : .09,
        delay: reduced ? 0 : delay,
        clearProps: "opacity,visibility,transform",
        scrollTrigger: { trigger: root.current, start: "top 92%", once: true },
      });
    });
    return () => {
      ctx.revert();
      animation.current = null;
    };
  }, [delay, reduced]);

  return <div ref={root} className={className} data-reveal="" onFocusCapture={() => animation.current?.progress(1)}>{children}</div>;
}
