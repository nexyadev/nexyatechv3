"use client";

import { MOTION_EVENT, MOTION_KEY } from "./motion-script";
import { useSyncExternalStore } from "react";
export { MOTION_EVENT, MOTION_KEY };

/**
 * Preferência de movimento do site, em <html data-motion="full|reduced">.
 * Padrão: segue prefers-reduced-motion do sistema. A escolha explícita do visitante (controle "Animações")
 * é salva em localStorage ("nx-motion"), com try/catch, só depois do clique.
 * "reduced" não deixa o site parado: mantém fades curtos e a seda em deriva muito lenta, sem parallax,
 * sem pin e sem velocidade ligada à rolagem.
 */
export type Motion = "full" | "reduced";
export function currentMotion(): Motion {
  if (typeof document === "undefined") return "full";
  const value = document.documentElement.dataset.motion;
  if (value === "full" || value === "reduced") return value;
  return matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduced" : "full";
}

export const isReducedMotion = () => currentMotion() === "reduced";

function subscribe(onChange: () => void) {
  window.addEventListener(MOTION_EVENT, onChange);
  // Sem escolha salva, acompanha mudanças do sistema em tempo real.
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const onSystem = () => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(MOTION_KEY); } catch { /* storage bloqueado */ }
    if (saved) return;
    document.documentElement.dataset.motion = media.matches ? "reduced" : "full";
    window.dispatchEvent(new Event(MOTION_EVENT));
  };
  media.addEventListener("change", onSystem);
  return () => { window.removeEventListener(MOTION_EVENT, onChange); media.removeEventListener("change", onSystem); };
}

/** true quando o movimento está reduzido. Componentes colocam isso nas dependências dos efeitos. */
export function useReducedMotionPref(): boolean {
  return useSyncExternalStore(subscribe, isReducedMotion, () => false);
}

export function setMotion(next: Motion) {
  document.documentElement.dataset.motion = next;
  try { localStorage.setItem(MOTION_KEY, next); } catch { /* storage bloqueado: vale só nesta visita */ }
  window.dispatchEvent(new Event(MOTION_EVENT));
}
