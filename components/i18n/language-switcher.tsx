"use client";

import { useParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, Globe } from "lucide-react";
import { getPathname, usePathname, useRouter } from "@/i18n/navigation";
import { locales, solutionKeyFromSlug, solutionSlug, type Locale } from "@/i18n/routing";
import { fmt, localeCodes, localeNames } from "@/i18n/dictionaries";
import { useI18n } from "./i18n-provider";

type Href = Parameters<typeof getPathname>[0]["href"];

/** Rota equivalente no idioma de destino (traduz o slug das soluções quando necessário). */
export function useLocalizedHref() {
  const pathname = usePathname();
  const params = useParams<{ slug?: string }>();
  const { locale } = useI18n();
  return (target: Locale): Href => {
    if (!pathname.includes("[slug]") || !params.slug) return pathname as Href;
    let slug = params.slug;
    if (pathname.startsWith("/solucoes")) { const key = solutionKeyFromSlug(locale, slug); if (key) slug = solutionSlug(target, key); }
    return { pathname, params: { slug } } as Href;
  };
}

/** Preferência explícita: cookie funcional "nx_lang", gravado só depois do clique (documentado na política). */
export function rememberLocale(locale: Locale) {
  try { document.cookie = `nx_lang=${locale}; path=/; max-age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`; } catch { /* cookies bloqueados: só não lembra */ }
}

export function useSwitchLocale() {
  const router = useRouter();
  const hrefFor = useLocalizedHref();
  return (target: Locale) => {
    rememberLocale(target);
    const y = scrollY;
    router.replace(hrefFor(target), { locale: target, scroll: false });
    // Mantém a posição de rolagem depois que a nova versão renderizar.
    requestAnimationFrame(() => requestAnimationFrame(() => scrollTo({ top: y, behavior: "instant" })));
  };
}

/** Botão com globo (SVG) + código do idioma; abre um menu acessível (role="menu"). */
export function LanguageSwitcher({ className = "", onDone }: { className?: string; onDone?: () => void }) {
  const { locale, m } = useI18n();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const id = useId();
  const switchTo = useSwitchLocale();

  useEffect(() => {
    if (!open) return;
    const items = menuRef.current?.querySelectorAll<HTMLElement>("[role=menuitemradio]");
    (menuRef.current?.querySelector<HTMLElement>('[aria-checked="true"]') ?? items?.[0])?.focus();
    const onDown = (e: PointerEvent) => { if (!menuRef.current?.contains(e.target as Node) && !buttonRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  function close(focusButton = true) { setOpen(false); if (focusButton) buttonRef.current?.focus(); }
  function onMenuKey(e: KeyboardEvent<HTMLUListElement>) {
    const items = [...(menuRef.current?.querySelectorAll<HTMLElement>("[role=menuitemradio]") ?? [])];
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length]?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.focus(); }
    else if (e.key === "Home") { e.preventDefault(); items[0]?.focus(); }
    else if (e.key === "End") { e.preventDefault(); items[items.length - 1]?.focus(); }
    else if (e.key === "Tab") close(false);
  }
  function choose(target: Locale) {
    close();
    onDone?.();
    if (target !== locale) switchTo(target);
  }

  return <div className={`lang ${className}`}>
    <button ref={buttonRef} type="button" className="lang-button" aria-haspopup="menu" aria-expanded={open} aria-controls={`${id}-menu`} aria-label={fmt(m.lang.button, { nome: localeNames[locale] })}
      onClick={() => setOpen((v) => !v)} onKeyDown={(e) => { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setOpen(true); } }}>
      <Globe size={16} strokeWidth={1.4} aria-hidden="true" /><span aria-hidden="true">{localeCodes[locale]}</span>
    </button>
    {open && <ul ref={menuRef} id={`${id}-menu`} role="menu" aria-label={m.lang.menu} className="lang-menu" onKeyDown={onMenuKey}>
      {locales.map((l) => <li role="none" key={l}>
        <button type="button" role="menuitemradio" aria-checked={l === locale} lang={l} tabIndex={-1} onClick={() => choose(l)}>
          <span>{localeNames[l]}</span>{l === locale && <Check size={15} aria-hidden="true" />}
        </button>
      </li>)}
    </ul>}
  </div>;
}

/** Versão de rodapé: links reais (rastreáveis) para a mesma página nos outros idiomas. */
export function LanguageLinks() {
  const { locale, m } = useI18n();
  const hrefFor = useLocalizedHref();
  const switchTo = useSwitchLocale();
  return <nav className="footer-lang" aria-label={m.lang.footer}>
    <Globe size={15} strokeWidth={1.4} aria-hidden="true" />
    {locales.map((l) => <a key={l} href={getPathname({ locale: l, href: hrefFor(l) })} hrefLang={l} lang={l} aria-current={l === locale ? "true" : undefined} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || l === locale) return; e.preventDefault(); switchTo(l); }}>{localeNames[l]}</a>)}
  </nav>;
}
