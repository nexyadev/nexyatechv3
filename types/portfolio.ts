export interface CaseImage { src: string; width: number; height: number; alt: string }
export type Satellite = CaseImage & { device: "phone" | "crop" };
export interface CaseVideo { mp4: string; webm: string; poster: string; width: number; height: number }

export interface PortfolioProject {
  slug: string;
  title: string;
  /** Tipo do projeto, exibido sob o nome. */
  category: string;
  /** Meta description e linha de apoio da página do case. */
  description: string;
  status: "documented" | "pending";
  /** Site no ar (link externo "Ver site"). */
  externalUrl?: string;
  /** Rótulo "Protótipo" quando o endereço não é o final. */
  prototype?: boolean;
  cover: CaseImage;
  /** Stack confirmada para ESTE projeto. Vazia = linha omitida (não chutar). */
  stack: readonly string[];
  /** "Desafio → o que construímos": 2 frases cada, só o que é verificável. */
  challenge: string;
  built: string;
  /** Só vai ao ar depois da aprovação do Eduardo. Falso = bloco "Desafio/Construímos" oculto. */
  textApproved: boolean;
  /** Captura alta que "rola" dentro da tela do notebook (largura fixa, altura livre). */
  scroll: CaseImage;
  /** Telas satélite em profundidades diferentes. */
  satellites: readonly [Satellite, Satellite];
  /** Vídeo curto de rolagem (mudo, loop, preload none). */
  video?: CaseVideo;
  gallery: readonly (CaseImage & { caption: string })[];
  /** Legenda sobre a origem das imagens. */
  imageNote: string;
  cta: { label: string; message: string };
}

/** The interface for a future approved source; the current source is local only. */
export interface PortfolioSource {
  list(): Promise<readonly PortfolioProject[]>;
  find(slug: string): Promise<PortfolioProject | undefined>;
}
