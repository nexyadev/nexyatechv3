"use client";

import { useEffect, useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import styles from "./lab.module.css";

/**
 * Marks its children as revealed when they enter the viewport. CSS does the masking, and only hides
 * content once scripts are confirmed (html.lab-js), so nothing is ever lost without JavaScript.
 */
export function Reveal({ children, className = "", as: Tag = "div", delay = 0 }: { children: ReactNode; className?: string; as?: "div" | "li" | "header"; delay?: number }) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { element.dataset.in = "true"; observer.disconnect(); }
    }, { rootMargin: "0px 0px -12% 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <Tag ref={ref} className={`${styles.reveal} ${className}`} data-reveal style={{ "--delay": `${delay}ms` } as CSSProperties}>{children}</Tag>;
}

/**
 * Dark glass card: the border light follows the pointer (conic gradient), a slight 3D tilt on hover,
 * and the ribbon light painted by the background (CSS vars written by the scene).
 */
export function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  function move(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width, y = (event.clientY - rect.top) / rect.height;
    element.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    element.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    element.style.setProperty("--angle", `${(Math.atan2(y - .5, x - .5) * 180 / Math.PI + 90).toFixed(1)}deg`);
    element.style.setProperty("--rx", `${((.5 - y) * 6).toFixed(2)}deg`);
    element.style.setProperty("--ry", `${((x - .5) * 8).toFixed(2)}deg`);
    element.dataset.hover = "true";
  }
  function leave() {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty("--rx", "0deg");
    element.style.setProperty("--ry", "0deg");
    element.dataset.hover = "false";
  }
  return <div ref={ref} className={`${styles.glass} ${className}`} data-ribbon-card onPointerMove={move} onPointerLeave={leave}>{children}</div>;
}
