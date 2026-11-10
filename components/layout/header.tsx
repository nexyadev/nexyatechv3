"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { LinkFeedback } from "@/components/layout/link-feedback";

const navigation = [
  { label: "Soluções", href: "/solucoes" },
  { label: "NEXYA Auto", href: "/nexya-auto" },
  { label: "Portfólio", href: "/portfolio" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (event.key === "Tab") {
        const links = menuRef.current?.querySelectorAll<HTMLAnchorElement>("a");
        const first = links?.[0];
        const last = links?.[links.length - 1];
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
    <header className="site-header">
      <div className="header-inner container">
        <Link href="/" className="brand" aria-label="NEXYA Tech — início" onClick={() => setOpen(false)}>
          <Image src="/images/logo-nexya.png" alt="NEXYA" width={174} height={58} priority sizes="174px" />
          <span className="brand-tech">TECH</span>
        </Link>
        <nav className="desktop-nav" aria-label="Navegação principal">
          {navigation.map(({ href, label }) => <Link key={href} href={href} className={pathname.startsWith(href) ? "active" : ""} aria-current={pathname.startsWith(href) ? "page" : undefined}>{label}<LinkFeedback /></Link>)}
        </nav>
        <Link href="/contato" className="header-cta" onClick={() => setOpen(false)}>Solicitar orçamento <ArrowUpRight size={15} aria-hidden="true" /><LinkFeedback /></Link>
        <button className="menu-toggle" type="button" ref={toggleRef} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen(!open)}>
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
      {open && <div id="mobile-menu" className="mobile-menu" ref={menuRef}>
        <p className="eyebrow">EXPLORE A NEXYA</p>
        <nav aria-label="Navegação móvel">
          {navigation.map(({ href, label }, index) => <Link key={href} href={href} aria-current={pathname.startsWith(href) ? "page" : undefined} onClick={() => setOpen(false)}><span className="menu-index">0{index + 1}</span>{label}<ArrowUpRight size={21} /></Link>)}
          <Link className="mobile-process" href="/processo" onClick={() => setOpen(false)}>Como trabalhamos <ArrowUpRight size={18} /></Link>
        </nav>
        <p className="mobile-menu-caption">Ideias em movimento.<br />Tecnologia com propósito.</p>
      </div>}
    </header>
  );
}
