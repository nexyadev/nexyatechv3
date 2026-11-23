"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, Search, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import type { AppPathname } from "@/i18n/routing";
import { whatsappHref } from "@/lib/config";
import { useI18n } from "@/components/i18n/i18n-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { openPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";
import { MotionToggle } from "./motion-toggle";
import { darkEnabled } from "@/lib/theme";

/** Menu principal: só páginas, sem âncoras. The Office fica fora do site. */
const navigation: { key: "home" | "solutions" | "projects" | "nexyaAuto" | "contact"; href: Exclude<AppPathname, `${string}[slug]`> }[] = [
  { key: "home", href: "/" },
  { key: "solutions", href: "/solucoes" },
  { key: "projects", href: "/projetos" },
  { key: "nexyaAuto", href: "/nexya-auto" },
  { key: "contact", href: "/contato" },
];

/** `pathname` é o caminho interno (ex.: /solucoes/[slug]), igual em todos os idiomas. */
function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const { m } = useI18n();
  const n = m.nav;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const contact = whatsappHref(m.whatsapp.default);
  const external = contact.startsWith("https") ? { target: "_blank", rel: "noopener noreferrer" } : {};

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    requestAnimationFrame(onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const focusables = () => [...(menuRef.current?.querySelectorAll<HTMLElement>("a, button:not([tabindex='-1'])") ?? [])];
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (event.key === "Tab") {
        const items = focusables();
        const first = items[0], last = items[items.length - 1];
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); toggleRef.current?.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); toggleRef.current?.focus();
        } else if (document.activeElement === toggleRef.current) {
          event.preventDefault(); (event.shiftKey ? last : first)?.focus();
        }
      }
    };
    const media = window.matchMedia("(min-width: 1000px)");
    const closeOnDesktop = () => { if (media.matches) setOpen(false); };
    media.addEventListener("change", closeOnDesktop);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", onKey);
      media.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);

  return (
    <header className="site-header" data-scrolled={scrolled} data-open={open}>
      <div className="header-inner container">
        <Link href="/" className="brand" aria-label={n.homeAria} onClick={() => setOpen(false)}>
          {/* SVG oficial (wordmark); next/image não otimiza SVG, então <img> direto evita custo extra. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={darkEnabled ? "logo-light" : undefined} src="/brand/nexya-wordmark.svg" alt="NEXYA" width={118} height={19} />
          {/* Versão prata só existe no HTML quando o modo escuro está ligado (flag). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {darkEnabled && <img className="logo-dark" src="/brand/nexya-wordmark-escuro.svg" alt="NEXYA" width={118} height={19} />}
        </Link>
        <nav className="desktop-nav" aria-label={n.mainNav}>
          {navigation.map(({ key, href }) => <Link key={key} href={href} aria-current={isActive(pathname, href) ? "page" : undefined}>{n[key]}</Link>)}
        </nav>
        <div className="header-tools">
          <button type="button" className="search-button" onClick={openPalette} aria-label={m.palette.open} aria-haspopup="dialog">
            <Search size={16} strokeWidth={1.4} aria-hidden="true" /><span className="search-label">{n.search}</span><kbd aria-hidden="true">Ctrl K</kbd>
          </button>
          <LanguageSwitcher className="header-lang" />
          {darkEnabled && <ThemeToggle className="header-theme" />}
          <a href={contact} className="button button-primary header-cta" {...external} onClick={() => setOpen(false)}>{n.cta} <ArrowUpRight size={15} aria-hidden="true" /></a>
          <button className="menu-toggle" type="button" ref={toggleRef} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? n.closeMenu : n.openMenu} onClick={() => setOpen(!open)}>
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {open && <div id="mobile-menu" className="mobile-menu" ref={menuRef}>
        <p className="eyebrow">{n.navEyebrow}</p>
        <nav aria-label={n.mobileNav}>
          {navigation.map(({ key, href }, index) => <Link key={key} href={href} aria-current={isActive(pathname, href) ? "page" : undefined} onClick={() => setOpen(false)}><span className="menu-index">0{index + 1}</span>{n[key]}<ArrowUpRight size={20} aria-hidden="true" /></Link>)}
        </nav>
        <div className="mobile-menu-tools">
          <LanguageSwitcher className="mobile-lang" />
          {darkEnabled && <ThemeToggle />}
          <MotionToggle />
          <button type="button" className="search-button" onClick={() => { setOpen(false); openPalette(); }}><Search size={16} strokeWidth={1.4} aria-hidden="true" /><span>{n.search}</span></button>
        </div>
        <a href={contact} className="button button-primary" {...external} onClick={() => setOpen(false)}>{n.ctaLong} <ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>}
    </header>
  );
}
