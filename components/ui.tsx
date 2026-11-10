import Link from "next/link";
import { ArrowDown, ArrowUpRight, MoveUpRight } from "lucide-react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { HeroSculpture } from "@/components/3d/hero-sculpture";
import { Reveal } from "@/components/animations/reveal";
import { LinkFeedback } from "@/components/layout/link-feedback";

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "text";
};

export function ButtonLink({ href, children, variant = "primary", className = "", ...props }: ButtonProps) {
  const external = /^https?:/.test(href);
  const linkProps = {
    className: `${variant === "text" ? "text-link" : `button button-${variant}`} ${className}`,
    ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
    ...props,
  };
  return (
    <Link href={href} {...linkProps}>
      <span>{children}</span>
      {href.startsWith("#") ? <ArrowDown size={17} aria-hidden="true" /> : <ArrowUpRight size={17} aria-hidden="true" />}
      {!external && <LinkFeedback />}
    </Link>
  );
}

export function PageIntro({ eyebrow, title, description, children }: { eyebrow: string; title: string; description?: string; children?: ReactNode }) {
  return (
    <section className="page-intro container">
      <Reveal>
        <p className="eyebrow"><span className="eyebrow-line" />{eyebrow}</p>
        <h1 className="display-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
        {children && <div className="page-intro-actions">{children}</div>}
      </Reveal>
      <span className="page-cross" aria-hidden="true">+</span>
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

export function FinalCta() {
  return (
    <section className="final-cta container" aria-labelledby="final-cta-title">
      <div className="final-cta-content">
        <p className="eyebrow"><span className="status-dot" />PRÓXIMO CAPÍTULO</p>
        <h2 id="final-cta-title">Sua próxima solução<br />começa com uma <em>conversa.</em></h2>
        <ButtonLink href="/contato">Vamos construir juntos</ButtonLink>
      </div>
      <div className="final-cta-art"><HeroSculpture compact /></div>
      <MoveUpRight className="final-cta-arrow" size={60} strokeWidth={0.75} aria-hidden="true" />
    </section>
  );
}
