import type { CaseVideo, PortfolioProject } from "@/types/portfolio";
import { getMessages } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/routing";

/**
 * Cases autorizados pelo Eduardo, nesta ordem. Nunca iframe dos sites: só imagem/vídeo + link externo.
 * Imagens do NEXYA Auto: SEMPRE da conta de demonstração (scripts/demo-nexya-auto).
 * Sites de clientes: só faixas seguras (scripts/capture-client-cases.mjs): sem placas, telefones,
 * nomes de clientes, depoimentos, antes/depois ou fotos de terceiros.
 * textApproved=false: "Desafio/O que construímos" ficam ocultos até a aprovação.
 * Textos por idioma: i18n/messages/*.ts (projects.cases).
 */
type CaseSlug = "nexya-auto" | "garagem-mendes" | "dra-camila-bioclass" | "enrico" | "site-nexya-tech";
type Img = { src: string; width: number; height: number };
type CaseStructure = {
  slug: CaseSlug; title: string; externalUrl?: string; prototype?: boolean; stack: readonly string[]; textApproved: boolean;
  cover: Img; scroll: Img; phone: Img; crop: Img; video?: CaseVideo;
  /** Cada item da galeria aponta para um alt do dicionário: "alt" | "mobileAlt" | "solutionsAlt". */
  gallery: readonly (Img & { altKey: "alt" | "mobileAlt" | "solutionsAlt" })[];
};

const video = (slug: string): CaseVideo => ({ mp4: `/projetos/${slug}/video.mp4`, webm: `/projetos/${slug}/video.webm`, poster: `/projetos/${slug}/poster.webp`, width: 960, height: 600 });
const desk = (slug: string): Img => ({ src: `/projetos/${slug}/desktop.webp`, width: 1600, height: 1000 });
const mob = (slug: string): Img => ({ src: `/projetos/${slug}/mobile.webp`, width: 600, height: 1298 });
const client = (slug: CaseSlug, scrollHeight: number) => ({
  cover: desk(slug), scroll: { src: `/projetos/${slug}/scroll.webp`, width: 1200, height: scrollHeight },
  phone: mob(slug), crop: desk(slug), video: video(slug),
  gallery: [{ ...desk(slug), altKey: "alt" as const }, { ...mob(slug), altKey: "mobileAlt" as const }],
});
const demo = (name: string, w = 1600, h = 1000): Img => ({ src: `/images/demo/${name}.webp`, width: w, height: h });

const structure: readonly CaseStructure[] = [
  {
    slug: "nexya-auto", title: "NEXYA Auto", textApproved: false,
    stack: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Node.js", "Prisma", "PostgreSQL"],
    cover: demo("nexya-auto-painel"), scroll: demo("nexya-auto-rolagem", 1200, 2250),
    phone: demo("nexya-auto-celular-painel", 600, 1298), crop: demo("nexya-auto-orcamentos"),
    // Sem vídeo: o vídeo do sistema segue bloqueado até a confirmação do arquivo.
    gallery: [
      { ...demo("nexya-auto-painel"), altKey: "alt" }, { ...demo("nexya-auto-os"), altKey: "alt" },
      { ...demo("nexya-auto-orcamentos"), altKey: "alt" }, { ...demo("nexya-auto-celular-painel", 600, 1298), altKey: "alt" },
    ],
  },
  // Confirmado no código-fonte do site publicado.
  { slug: "garagem-mendes", title: "Garagem Mendes", externalUrl: "https://garagemmendes.com.br/", textApproved: false, stack: ["HTML", "CSS", "JavaScript", "GSAP"], ...client("garagem-mendes", 3000) },
  // Confirmado no repositório e no site publicado.
  { slug: "dra-camila-bioclass", title: "Dra. Camila Bioclass", externalUrl: "https://www.dracamilabioclass.com/", textApproved: false, stack: ["HTML", "CSS", "JavaScript"], ...client("dra-camila-bioclass", 3000) },
  // Endereço provisório no GitHub Pages; o README diz que o domínio final não foi definido. Stack pelo README.
  { slug: "enrico", title: "En.r.ico", externalUrl: "https://nexyadev.github.io/enrico/", prototype: true, textApproved: false, stack: ["HTML", "CSS", "JavaScript", "Three.js", "GSAP"], ...client("enrico", 2300) },
  {
    slug: "site-nexya-tech", title: "Site NEXYA Tech", textApproved: false,
    stack: ["TypeScript", "React", "Next.js", "Tailwind CSS", "GSAP", "WebGL", "Zod", "Playwright"],
    cover: { src: "/images/cases/site-nexya-tech-topo.webp", width: 1600, height: 1000 },
    scroll: { src: "/images/cases/site-nexya-tech-rolagem.webp", width: 1200, height: 2250 },
    phone: { src: "/images/cases/site-nexya-tech-celular.webp", width: 600, height: 1298 },
    crop: { src: "/images/cases/site-nexya-tech-solucoes.webp", width: 1600, height: 1000 },
    video: video("site-nexya-tech"),
    gallery: [
      { src: "/images/cases/site-nexya-tech-topo.webp", width: 1600, height: 1000, altKey: "alt" },
      { src: "/images/cases/site-nexya-tech-solucoes.webp", width: 1600, height: 1000, altKey: "solutionsAlt" },
      { src: "/images/cases/site-nexya-tech-celular.webp", width: 600, height: 1298, altKey: "mobileAlt" },
    ],
  },
];

export function getLocalizedProjects(locale: Locale): readonly PortfolioProject[] {
  const cases = getMessages(locale).projects.cases;
  return structure.map((s) => {
    const t = cases[s.slug] as (typeof cases)[CaseSlug] & { mobileAlt?: string; solutionsAlt?: string };
    return {
      slug: s.slug, title: s.title, category: t.category, description: t.description, status: "documented",
      externalUrl: s.externalUrl, prototype: s.prototype, stack: s.stack,
      challenge: t.challenge, built: t.built, textApproved: s.textApproved,
      cover: { ...s.cover, alt: t.alt }, scroll: { ...s.scroll, alt: t.scrollAlt },
      satellites: [{ ...s.phone, alt: "", device: "phone" }, { ...s.crop, alt: "", device: "crop" }],
      video: s.video,
      gallery: s.gallery.map((g, i) => ({ src: g.src, width: g.width, height: g.height, alt: t[g.altKey] ?? t.alt, caption: t.captions[i] ?? "" })),
      imageNote: t.imageNote, cta: { label: t.ctaLabel, message: t.ctaMessage },
    };
  });
}

/** Tecnologias confirmadas em algum dos cases (faixa geral de /projetos). */
export const allStack = [...new Set(structure.flatMap((s) => s.stack))];
export const caseSlugs = structure.map((s) => s.slug);
