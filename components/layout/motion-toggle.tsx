"use client";

import { useI18n } from "@/components/i18n/i18n-provider";
import { setMotion, useReducedMotionPref } from "@/lib/motion";

/**
 * Controle "Animações: ligadas/reduzidas" (role="switch"). O padrão segue o sistema; a escolha explícita
 * é salva em localStorage ("nx-motion") só depois do clique. Ícone em SVG (nunca emoji).
 */
export function MotionToggle({ className = "" }: { className?: string }) {
  const { m } = useI18n();
  const reduced = useReducedMotionPref();
  return <button type="button" role="switch" aria-checked={!reduced} className={`motion-toggle ${className}`}
    onClick={() => setMotion(reduced ? "full" : "reduced")}>
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true" focusable="false">
      {reduced
        ? <><path d="M3 12h18" /><circle cx="12" cy="12" r="2.2" /></>
        : <><path d="M3 12c3-6 6-6 9 0s6 6 9 0" /><circle cx="12" cy="12" r="2.2" /></>}
    </svg>
    <span>{m.motion.label}: <strong>{reduced ? m.motion.reduced : m.motion.on}</strong></span>
  </button>;
}
