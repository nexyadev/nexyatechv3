"use client";

import { useRouter as useNextRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpRight, CornerDownLeft, FileText, Globe, MessageCircle, Search, X } from "lucide-react";
import { useI18n } from "@/components/i18n/i18n-provider";
import { useSwitchLocale } from "@/components/i18n/language-switcher";
import { localeNames } from "@/i18n/dictionaries";
import { locales, type Locale } from "@/i18n/routing";
import { whatsappHref } from "@/lib/config";

const EVENT = "nx:palette";
/** Abre a paleta de qualquer lugar (botão "Buscar" do header e do menu mobile). */
export const openPalette = () => window.dispatchEvent(new Event(EVENT));

type Item = { id: string; group: "pages" | "actions" | "languages"; label: string; run: () => void; icon: "page" | "whatsapp" | "lang"; current?: boolean };
const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Módulo B: paleta de comandos leve (sem biblioteca). role="dialog" + combobox/listbox (aria-activedescendant),
 * foco preso, Esc fecha e devolve o foco, Ctrl/Cmd+K alterna. Nada é enviado: só navegação local.
 */
export function CommandPalette() {
  const { locale, m, pages } = useI18n();
  const p = m.palette;
  const router = useNextRouter();
  const switchTo = useSwitchLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const id = useId();

  const show = useCallback(() => { returnFocus.current = document.activeElement as HTMLElement; setQuery(""); setActive(0); setOpen(true); }, []);
  const close = useCallback(() => { setOpen(false); requestAnimationFrame(() => returnFocus.current?.focus?.()); }, []);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); if (open) close(); else show(); }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(EVENT, show);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener(EVENT, show); };
  }, [open, show, close]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => { document.body.style.overflow = original; };
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const all: Item[] = [
      ...pages.map((page) => ({ id: `page-${page.key}`, group: "pages" as const, label: page.label, icon: "page" as const, run: () => router.push(page.href) })),
      { id: "whatsapp", group: "actions", label: p.whatsapp, icon: "whatsapp", run: () => window.open(whatsappHref(m.whatsapp.default), "_blank", "noopener,noreferrer") },
      ...locales.map((l: Locale) => ({ id: `lang-${l}`, group: "languages" as const, label: localeNames[l], icon: "lang" as const, current: l === locale, run: () => { if (l !== locale) switchTo(l); } })),
    ];
    const q = normalize(query.trim());
    return q ? all.filter((item) => normalize(item.label).includes(q)) : all;
  }, [pages, p.whatsapp, m.whatsapp.default, locale, query, router, switchTo]);

  const safeActive = Math.min(active, Math.max(items.length - 1, 0));
  function run(item: Item | undefined) { if (!item) return; close(); item.run(); }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((safeActive + 1) % Math.max(items.length, 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((safeActive - 1 + items.length) % Math.max(items.length, 1)); }
    else if (e.key === "Home" && e.target !== inputRef.current) { e.preventDefault(); setActive(0); }
    else if (e.key === "Enter" && e.target === inputRef.current) { e.preventDefault(); run(items[safeActive]); }
    else if (e.key === "Tab") {
      // Foco preso: só o campo e o botão de fechar recebem foco.
      const focusables = [...(dialogRef.current?.querySelectorAll<HTMLElement>("input, button[data-close]") ?? [])];
      const i = focusables.indexOf(document.activeElement as HTMLElement);
      e.preventDefault();
      focusables[(i + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length]?.focus();
    }
  }

  useEffect(() => { document.getElementById(`${id}-opt-${safeActive}`)?.scrollIntoView({ block: "nearest" }); }, [safeActive, id, open]);

  if (!open) return null;
  const groups: { key: Item["group"]; label: string }[] = [{ key: "pages", label: p.pages }, { key: "actions", label: p.actions }, { key: "languages", label: p.languages }];
  const Icon = ({ kind }: { kind: Item["icon"] }) => kind === "whatsapp" ? <MessageCircle size={16} aria-hidden="true" /> : kind === "lang" ? <Globe size={16} aria-hidden="true" /> : <FileText size={16} aria-hidden="true" />;

  return <div className="palette-backdrop" onPointerDown={(e) => { if (e.target === e.currentTarget) close(); }}>
    <div ref={dialogRef} className="palette" role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} onKeyDown={onKeyDown}>
      <h2 id={`${id}-title`} className="sr-only">{p.title}</h2>
      <div className="palette-search">
        <Search size={18} strokeWidth={1.4} aria-hidden="true" />
        <input ref={inputRef} type="text" role="combobox" aria-expanded="true" aria-controls={`${id}-list`} aria-autocomplete="list" aria-activedescendant={items.length ? `${id}-opt-${safeActive}` : undefined} aria-describedby={`${id}-hint`}
          placeholder={p.placeholder} value={query} onChange={(e) => { setQuery(e.target.value); setActive(0); }} autoComplete="off" spellCheck={false} />
        <button type="button" data-close className="palette-close" onClick={close} aria-label={p.close}><X size={18} aria-hidden="true" /></button>
      </div>
      <p id={`${id}-hint`} className="sr-only">{p.hint}</p>
      <div id={`${id}-list`} role="listbox" aria-label={p.results} className="palette-list">
        {items.length === 0 && <p className="palette-empty" role="status">{p.empty}</p>}
        {groups.map((g) => {
          const groupItems = items.map((item, index) => ({ item, index })).filter(({ item }) => item.group === g.key);
          if (!groupItems.length) return null;
          return <div role="group" aria-labelledby={`${id}-g-${g.key}`} key={g.key}>
            <p id={`${id}-g-${g.key}`} className="palette-group">{g.label}</p>
            {groupItems.map(({ item, index }) => <div key={item.id} id={`${id}-opt-${index}`} role="option" aria-selected={index === safeActive} className="palette-option"
              onPointerMove={() => setActive(index)} onClick={() => run(item)}>
              <Icon kind={item.icon} /><span lang={item.group === "languages" ? item.id.slice(5) : undefined}>{item.label}</span>
              {item.current && <span className="palette-current" aria-hidden="true" />}
              {index === safeActive && (item.icon === "whatsapp" ? <ArrowUpRight size={15} aria-hidden="true" /> : <CornerDownLeft size={15} aria-hidden="true" />)}
            </div>)}
          </div>;
        })}
      </div>
    </div>
  </div>;
}
