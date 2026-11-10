"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import type { ComponentProps, PointerEvent } from "react";

const MotionLink = motion.create(Link);
type MagneticLinkProps = Pick<ComponentProps<typeof Link>, "href" | "className" | "children" | "target" | "rel" | "aria-label">;

export function MagneticLink({ children, ...props }: MagneticLinkProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 24, mass: .3 });
  const springY = useSpring(y, { stiffness: 220, damping: 24, mass: .3 });
  const reducedMotion = useReducedMotion();

  function move(event: PointerEvent<HTMLAnchorElement>) {
    if (reducedMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - bounds.left - bounds.width / 2) * .1);
    y.set((event.clientY - bounds.top - bounds.height / 2) * .14);
  }

  function reset() { x.set(0); y.set(0); }

  return <MotionLink {...props} style={{ x: springX, y: springY }} onPointerMove={move} onPointerLeave={reset} onBlur={reset}>{children}</MotionLink>;
}
