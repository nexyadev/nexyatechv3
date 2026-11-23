"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Messages } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/routing";

/** Só o necessário para a interface comum no cliente (menu, seletor, paleta, cursor, erros). */
export type ClientMessages = Pick<Messages, "nav" | "motion" | "bands" | "theme" | "lang" | "palette" | "cursor" | "a11y" | "whatsapp" | "status">;
type Ctx = { locale: Locale; m: ClientMessages; pages: { key: string; label: string; href: string }[] };

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ value, children }: { value: Ctx; children: ReactNode }) {
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n fora do I18nProvider");
  return ctx;
}
