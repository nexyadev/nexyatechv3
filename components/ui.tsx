import type { AnchorHTMLAttributes, ComponentProps, ReactNode } from "react";
import { ArrowDown, ArrowUpRight, MoveUpRight } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { LinkFeedback } from "@/components/layout/link-feedback";
import { Link } from "@/i18n/navigation";
import type { Messages } from "@/i18n/dictionaries";

export type AppHref = ComponentProps<typeof Link>["href"];

type ButtonProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  /** Rota interna (traduzida pelo idioma), âncora "#..." ou URL externa. */
  href: AppHref | string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "text";
  /** Texto para leitores de tela quando o link abre em nova aba. */
  newTabLabel?: string;
};

const isRaw = (href: AppHref | string): href is string => typeof href === "string" && (/^(https?:|mailto:|#)/.test(href));

export function ButtonLink({ href, children, variant = "primary", className = "", newTabLabel, ...props }: ButtonProps) {
  const cls = `${variant === "text" ? "text-link" : `button button-${variant}`} ${className}`;
  if (isRaw(href)) {
    const external = /^https?:/.test(href);
    return <a href={href} className={cls} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...props}>
      <span>{children}</span>{external && newTabLabel && <span className="sr-only"> {newTabLabel}</span>}
      {href.startsWith("#") ? <ArrowDown size={17} aria-hidden="true" /> : <ArrowUpRight size={17} aria-hidden="true" />}
    </a>;
  }
  return <Link href={href as AppHref} className={cls} {...props}>
    <span>{children}</span><ArrowUpRight size={17} aria-hidden="true" /><LinkFeedback />
  </Link>;
}

/** `aside` ocupa o lado direito do topo (no lugar do "+" decorativo). */
export function PageIntro({ eyebrow, title, description, children, aside }: { eyebrow: string; title: string; description?: string; children?: ReactNode; aside?: ReactNode }) {
  return (
    <section className={`page-intro container ${aside ? "page-intro-split" : ""}`}>
      <Reveal>
        <p className="eyebrow"><span className="eyebrow-line" />{eyebrow}</p>
        <h1 className="display-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
        {children && <div className="page-intro-actions">{children}</div>}
      </Reveal>
      {aside ? <div className="page-intro-aside">{aside}</div> : <span className="page-cross" aria-hidden="true">+</span>}
    </section>
  );
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="section-heading">
      <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
      {description && <p>{description}</p>}
    </div>
  );
}

export function FinalCta({ m, href, newTabLabel }: { m: Messages["finalCta"]; href: string; newTabLabel: string }) {
  return (
    <section id="contato" className="final-cta container" aria-labelledby="final-cta-title">
      <div className="final-cta-content">
        <p className="eyebrow"><span className="eyebrow-line" />{m.eyebrow}</p>
        <h2 id="final-cta-title">{m.line1}<br />{m.line2} <em>{m.em}</em></h2>
        <ButtonLink href={href} newTabLabel={newTabLabel}>{m.button}</ButtonLink>
      </div>
      <MoveUpRight className="final-cta-arrow" size={60} strokeWidth={0.75} aria-hidden="true" />
    </section>
  );
}
