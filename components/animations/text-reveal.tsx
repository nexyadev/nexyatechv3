"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function TextReveal({ text, className = "" }: { text: string; className?: string }) {
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      if (!root.current) return;
      gsap.fromTo(root.current.querySelectorAll("[data-reveal-word]"), { opacity: .36 }, {
        opacity: 1,
        stagger: .2,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top 83%", end: "bottom 45%", scrub: .7 },
      });
    });
    return () => media.revert();
  }, []);

  return (
    <span ref={root} className={className}>
      <span className="sr-only">{text}</span>
      {text.split(" ").map((word, i) => <span key={`${word}-${i}`} data-reveal-word aria-hidden="true">{word}{" "}</span>)}
    </span>
  );
}
