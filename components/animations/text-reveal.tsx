"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotionPref } from "@/lib/motion";

export function TextReveal({ text, className = "" }: { text: string; className?: string }) {
  const root = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotionPref();

  useEffect(() => {
    // Movimento reduzido: texto pronto, sem efeito ligado à rolagem.
    const el = root.current;
    if (reduced || !el) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll("[data-reveal-word]"), { opacity: .36 }, {
        opacity: 1,
        stagger: .2,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 83%", end: "bottom 45%", scrub: .7 },
      });
    });
    return () => ctx.revert();
  }, [reduced]);

  return (
    <span ref={root} className={className}>
      <span className="sr-only">{text}</span>
      {text.split(" ").map((word, i) => <span key={`${word}-${i}`} data-reveal-word aria-hidden="true">{word}{" "}</span>)}
    </span>
  );
}
