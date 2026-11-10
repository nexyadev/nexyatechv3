"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAnimate, useReducedMotion } from "motion/react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [scope, animate] = useAnimate();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !scope.current) return;
    const element = scope.current as HTMLDivElement;
    const animation = animate(element, { opacity: [.7, 1], y: [5, 0] }, { duration: .35, ease: "easeOut" });
    return () => {
      animation.stop();
      element.style.removeProperty("opacity");
      element.style.removeProperty("transform");
    };
  }, [pathname, animate, scope, reducedMotion]);

  return <div ref={scope}>{children}</div>;
}
