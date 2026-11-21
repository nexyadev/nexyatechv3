"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { LOGO_IMAGE } from "@/lib/brand/logo-geometry";
import styles from "./lab.module.css";

/** Same destinations as the site navigation. `section` marks the item while that /lab section is in view. */
const NAVIGATION = [
  { label: "Soluções", href: "/solucoes", section: "solucoes" },
  { label: "NEXYA Auto", href: "/nexya-auto", section: "produto" },
  { label: "Portfólio", href: "/portfolio", section: "portfolio" },
  { label: "Sobre", href: "/sobre", section: "manifesto" },
  { label: "Contato", href: "/contato", section: "contato" },
] as const;

export function LabHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    NAVIGATION.forEach(({ section }) => { const element = document.getElementById(section); if (element) observer.observe(element); });
    const hero = document.getElementById("inicio");
    if (hero) observer.observe(hero);
    return () => { window.removeEventListener("scroll", onScroll); observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={styles.header} data-scrolled={scrolled || open ? "true" : "false"}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.brand} aria-label="NEXYA Tech — início">
          <span className={styles.brandMark} data-lab-brand>
            <Image src={LOGO_IMAGE.src} alt="NEXYA" width={LOGO_IMAGE.width} height={LOGO_IMAGE.height} sizes="150px" priority />
          </span>
        </Link>
        <nav className={styles.nav} aria-label="Navegação principal">
          {NAVIGATION.map((item) => (
            <Link key={item.href} href={item.href} data-active={active === item.section ? "true" : "false"}>{item.label}</Link>
          ))}
        </nav>
        <Link href="/contato" className={styles.headerCta}>Solicitar orçamento <ArrowRight size={15} aria-hidden="true" /></Link>
        <button ref={toggle} type="button" className={styles.menuToggle} aria-expanded={open} aria-controls="lab-menu" aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen(!open)}>
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>
      {open && (
        <div id="lab-menu" ref={menu} className={styles.mobileMenu}>
          <nav aria-label="Navegação móvel">
            {NAVIGATION.map((item, index) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}><span>0{index + 1}</span>{item.label}</Link>)}
            <Link href="/contato" onClick={() => setOpen(false)}><span>→</span>Solicitar orçamento</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
