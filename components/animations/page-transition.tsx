"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isReducedMotion } from "@/lib/motion";

/**
 * Módulo A: transição de página com a seda. Ao trocar de rota, uma fita de luz (gradiente + clip-path)
 * atravessa a tela em ~600ms e revela a nova página. Não atrasa nada: a navegação já aconteceu, o conteúdo
 * novo já está no DOM e focável; a camada é pointer-events: none e aria-hidden.
 * Movimento reduzido: fade curto do conteúdo (150ms).
 * Só roda quando a rota MUDA (compara com a anterior): nunca no primeiro carregamento, nem quando o
 * React StrictMode (modo dev) executa o efeito duas vezes.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lastPath = useRef(pathname);
  const veilRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    const veil = veilRef.current, content = contentRef.current;
    if (!veil || !content) return;
    if (isReducedMotion()) {
      const fade = content.animate([{ opacity: .6 }, { opacity: 1 }], { duration: 150, easing: "ease-out" });
      return () => fade.cancel();
    }
    // Véu de papel que se abre da esquerda para a direita, com a fita de luz na borda.
    const wipe = veil.animate(
      [{ clipPath: "inset(0 0 0 0)", opacity: 1 }, { clipPath: "inset(0 0 0 100%)", opacity: 1 }],
      { duration: 620, easing: "cubic-bezier(.65,0,.35,1)", fill: "forwards" },
    );
    const ribbon = veil.firstElementChild?.animate(
      [{ transform: "translate3d(-30vw,0,0) skewX(-18deg)" }, { transform: "translate3d(115vw,0,0) skewX(-18deg)" }],
      { duration: 620, easing: "cubic-bezier(.65,0,.35,1)", fill: "forwards" },
    );
    veil.dataset.active = "true";
    wipe.onfinish = () => { veil.dataset.active = "false"; };
    return () => { wipe.cancel(); ribbon?.cancel(); veil.dataset.active = "false"; };
  }, [pathname]);

  return <>
    <div ref={veilRef} className="silk-veil" data-active="false" aria-hidden="true"><span className="silk-ribbon" /></div>
    <div ref={contentRef}>{children}</div>
  </>;
}
