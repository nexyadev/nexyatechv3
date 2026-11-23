import { LogoIntro } from "./logo-intro";

type Variant = "claro" | "escuro";

/**
 * Logo oficial de public/brand. O HTML leva só um <img> (arquivo em cache, fora do payload);
 * quando a abertura roda, o cliente busca o mesmo SVG e o monta inline para animar letra por letra.
 */
export function InlineLogo({ variant = "claro", className, intro = false, label }: { variant?: Variant; className?: string; intro?: boolean; label: string }) {
  return <LogoIntro className={className} src={`/brand/nexya-logo-${variant}.svg`} srcDark="/brand/nexya-logo-escuro.svg" animate={intro} label={label} />;
}
