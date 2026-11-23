"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotionPref } from "@/lib/motion";

type State = "idle" | "live" | "static";

/**
 * Fundo fixo do site todo. A WebP estática do próprio efeito aparece primeiro; o shader assume depois.
 * Sem WebGL ou aparelho lento: WebP estática do próprio efeito. Movimento reduzido: o shader roda em deriva
 * muito lenta e de baixa intensidade, sem mouse e sem rolagem.
 */
export function SatinBackground() {
  const reduced = useReducedMotionPref();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    let stop: (() => void) | undefined;
    let cancelled = false;
    const mobile = window.matchMedia("(max-width: 899px), (pointer: coarse)").matches;
    const boot = () => {
      import("./satin-engine").then(({ startSatin }) => {
        if (cancelled || !canvasRef.current) return;
        stop = startSatin(canvasRef.current, mobile, { onReady: () => setState("live"), onFail: () => setState("static") }, reduced);
      }).catch(() => setState("static"));
    };
    // A WebP estática já está na tela; o shader entra por cima na primeira interação ou após ~3,5s ociosos,
    // fora da janela de carregamento (não disputa CPU com a hidratação nem com o LCP).
    let started = false;
    const triggers = ["pointermove", "pointerdown", "scroll", "keydown", "touchstart"];
    const start = () => {
      if (started) return;
      started = true;
      triggers.forEach((name) => window.removeEventListener(name, start));
      window.clearTimeout(timer);
      boot();
    };
    const timer = window.setTimeout(() => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(start, { timeout: 1000 }) : start()), 3500);
    triggers.forEach((name) => window.addEventListener(name, start, { passive: true, once: true }));
    return () => { cancelled = true; window.clearTimeout(timer); triggers.forEach((name) => window.removeEventListener(name, start)); stop?.(); };
  }, [reduced]);

  return <div className="satin" data-state={state} aria-hidden="true">
    <div className="satin-still" data-testid="satin-still" />
    {/* key: ao trocar o modo de movimento, um canvas novo (o contexto WebGL anterior foi liberado). */}
    {state !== "static" && <canvas key={reduced ? "reduced" : "full"} ref={canvasRef} className="satin-canvas" />}
  </div>;
}
