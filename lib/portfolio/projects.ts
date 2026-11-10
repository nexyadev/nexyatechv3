import type { PortfolioProject } from "@/types/portfolio";

/**
 * Approved project names supplied in the brief. No GitHub requests or credentials.
 * Add only approved descriptions and real captures to each project.
 */
export const projects: readonly PortfolioProject[] = [
  {
    slug: "nexya-auto",
    title: "NEXYA Auto",
    category: "Produto próprio · Gestão de oficinas",
    description: "Uma plataforma para organizar clientes, veículos e o dia a dia da oficina.",
    featured: true,
    status: "documented",
    cover: { src: "/images/nexya-auto-dashboard.webp", alt: "Captura real do painel NEXYA Auto, divulgada no site oficial do produto com nomes e valores ocultados." },
    accent: "blue",
    details: [
      "Cadastro e organização de clientes e veículos.",
      "Ordens de serviço para acompanhar o trabalho da oficina.",
      "Checklists e fotos de entrada para registrar o veículo.",
      "Orçamentos e gestão da operação.",
    ],
  },
  {
    slug: "garagem-mendes",
    title: "Garagem Mendes",
    category: "Projeto · Case em preparação",
    description: "Os detalhes e as imagens deste projeto serão apresentados após a revisão do material.",
    featured: false,
    status: "pending",
    cover: null,
    accent: "silver",
    details: [],
  },
  {
    slug: "ang",
    title: "ANG",
    category: "Projeto · Case em preparação",
    description: "Os detalhes e as imagens deste projeto serão apresentados após a revisão do material.",
    featured: false,
    status: "pending",
    cover: null,
    accent: "amber",
    details: [],
  },
  {
    slug: "veia-criativa",
    title: "Aveia / Veia Criativa",
    category: "Projeto · Case em preparação",
    description: "A apresentação deste projeto está em preparação. Nome de exibição e material em confirmação.",
    featured: false,
    status: "pending",
    cover: null,
    accent: "violet",
    details: [],
    namePending: true,
  },
];
