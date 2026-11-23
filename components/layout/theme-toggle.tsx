"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";

export type Theme = "light" | "dark";
import { THEME_KEY as KEY } from "@/lib/theme";
export const THEME_EVENT = "nx:theme";

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/** Botão sol/lua: alterna, salva a escolha e faz a troca suave (300 ms) só durante a transição. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { m } = useI18n();
  // O tema vive no <html data-theme>; o servidor não sabe qual é (o CSS já mostra o ícone certo).
  const theme = useSyncExternalStore(subscribe, currentTheme, () => null);

  useEffect(() => {
    // Sem escolha salva, acompanha mudanças do sistema.
    const media = matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => {
      let saved: string | null = null;
      try { saved = localStorage.getItem(KEY); } catch { /* storage bloqueado */ }
      if (saved) return;
      const next: Theme = media.matches ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
    };
    media.addEventListener("change", onSystem);
    return () => media.removeEventListener("change", onSystem);
  }, []);

  function toggle() {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.add("theme-switching");
    root.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch { /* storage bloqueado: vale só nesta visita */ }
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
    window.setTimeout(() => root.classList.remove("theme-switching"), 350);
  }

  const dark = theme === "dark";
  return <button type="button" className={`theme-toggle ${className}`} onClick={toggle} aria-label={dark ? m.theme.toLight : m.theme.toDark} title={dark ? m.theme.toLight : m.theme.toDark}>
    {/* Antes de hidratar, os dois ícones existem e o CSS mostra o certo pelo tema já aplicado. */}
    <Sun className="theme-icon-sun" size={17} strokeWidth={1.4} aria-hidden="true" />
    <Moon className="theme-icon-moon" size={17} strokeWidth={1.4} aria-hidden="true" />
  </button>;
}
