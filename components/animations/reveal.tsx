"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Progressive enhancement: all content remains visible without JavaScript. */
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const root = useRef<HTMLDivElement>(null);
  const animation = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      if (!root.current) return;
      const items = root.current.querySelectorAll<HTMLElement>("[data-reveal-item]");
      const targets = items.length ? Array.from(items) : root.current;
      animation.current = gsap.fromTo(targets, { opacity: 0, y: 28 }, {
        opacity: 1,
        y: 0,
        duration: .85,
        ease: "power3.out",
        stagger: .09,
        delay,
        clearProps: "opacity,visibility,transform",
        scrollTrigger: { trigger: root.current, start: "top 92%", once: true },
      });
    });
    return () => {
      media.revert();
      animation.current = null;
    };
  }, [delay]);

  return <div ref={root} className={className} onFocusCapture={() => animation.current?.progress(1)}>{children}</div>;
}
