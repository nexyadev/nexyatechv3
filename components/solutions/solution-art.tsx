export type SolutionKind = "systems" | "automation" | "web" | "connections";

export const kindBySlug: Record<string, SolutionKind> = { sistemas: "systems", automacoes: "automation", sites: "web", integracoes: "connections" };

/**
 * Mini-ilustrações de linha fina. Cada traço usa pathLength=1 para "se desenhar" (stroke-dashoffset)
 * quando o card entra na tela ou recebe hover/foco; o resto anima só com transform/opacity.
 * Sem JS ou com reduced-motion: aparecem desenhadas e paradas (ver globals.css).
 */
export function SolutionArt({ kind, className = "" }: { kind: SolutionKind; className?: string }) {
  return <svg className={`sol-art sol-art-${kind} ${className}`} viewBox="0 0 200 140" fill="none" aria-hidden="true" focusable="false">
    {kind === "systems" && <>
      {[0, 1, 2].map((i) => <g key={i} className="sol-layer" style={{ ["--i" as string]: i }}>
        <path pathLength={1} className="sol-draw" d="M100 34 L152 60 L100 86 L48 60 Z" />
        {i === 2 && <path pathLength={1} className="sol-draw" d="M48 60 L48 66 L100 92 L152 66 L152 60" />}
      </g>)}
      <circle className="sol-dot" cx="128" cy="58" r="2.6" />
    </>}
    {kind === "automation" && <>
      <path pathLength={1} className="sol-draw" d="M54 70 H86 M114 70 H146" />
      <path pathLength={1} className="sol-draw sol-faint" d="M40 56 C40 30 100 26 100 50 M100 90 C100 114 160 110 160 84" />
      {[40, 100, 160].map((x, i) => <path key={x} pathLength={1} className={`sol-draw ${i === 2 ? "sol-strong" : ""}`} d={`M${x} 56 L${x + 14} 70 L${x} 84 L${x - 14} 70 Z`} />)}
      <circle className="sol-runner" cx="54" cy="70" r="2.8" />
    </>}
    {kind === "web" && <>
      <rect pathLength={1} className="sol-draw" x="34" y="22" width="132" height="96" rx="7" />
      <path pathLength={1} className="sol-draw" d="M34 38 H166" />
      <circle className="sol-dot" cx="44" cy="30" r="1.8" /><circle className="sol-dot" cx="51" cy="30" r="1.8" /><circle className="sol-dot" cx="58" cy="30" r="1.8" />
      <rect className="sol-block" style={{ ["--i" as string]: 0 }} x="46" y="50" width="70" height="7" rx="2" />
      <rect className="sol-block" style={{ ["--i" as string]: 1 }} x="46" y="63" width="48" height="4" rx="2" />
      <rect className="sol-block sol-block-line" style={{ ["--i" as string]: 2 }} x="46" y="80" width="50" height="26" rx="3" />
      <rect className="sol-block sol-block-line" style={{ ["--i" as string]: 3 }} x="104" y="80" width="50" height="26" rx="3" />
    </>}
    {kind === "connections" && <>
      <g className="sol-orbits">
        <ellipse pathLength={1} className="sol-draw" cx="100" cy="70" rx="62" ry="22" transform="rotate(-30 100 70)" />
        <ellipse pathLength={1} className="sol-draw" cx="100" cy="70" rx="62" ry="22" transform="rotate(30 100 70)" />
        <ellipse pathLength={1} className="sol-draw sol-faint" cx="100" cy="70" rx="62" ry="22" transform="rotate(90 100 70)" />
        <circle className="sol-dot" cx="154" cy="40" r="2.6" /><circle className="sol-dot" cx="46" cy="100" r="2.2" /><circle className="sol-dot" cx="100" cy="9" r="2" />
      </g>
      <circle className="sol-core" cx="100" cy="70" r="5" />
    </>}
  </svg>;
}
